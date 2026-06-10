import { useRef, useEffect, useCallback } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import type { StorageUnit } from '../db/storageUnitDao';
import { Colors, FontSize, Spacing } from '../constants/theme';

const BASE_UNIT = 1.8;

interface CubeDemoProps {
  roomId: string;
  ratioX: number;
  ratioZ: number;
  units: StorageUnit[];
  version: number;
}

function hexToColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

export default function CubeDemo({ roomId, ratioX, ratioZ, units, version }: CubeDemoProps) {
  const isDraggingRef = useRef(false);
  const sphericalRef = useRef({ theta: 0, phi: Math.PI / 4 });
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const prevDxRef = useRef(0);
  const prevDyRef = useRef(0);

  const roomW = ratioX * BASE_UNIT;
  const roomD = ratioZ * BASE_UNIT;
  const wallH = BASE_UNIT * 1.5;
  const hw = roomW / 2;
  const hd = roomD / 2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDraggingRef.current = true;
        prevDxRef.current = 0;
        prevDyRef.current = 0;
      },
      onPanResponderMove: (_, g) => {
        if (!isDraggingRef.current) return;
        const s = sphericalRef.current;
        const deltaX = g.dx - prevDxRef.current;
        const deltaY = g.dy - prevDyRef.current;
        prevDxRef.current = g.dx;
        prevDyRef.current = g.dy;
        s.theta -= deltaX * 0.005;
        s.phi -= deltaY * 0.005;
        s.phi = Math.max(0.1, Math.min(1.4, s.phi));
      },
      onPanResponderRelease: () => { isDraggingRef.current = false; },
    })
  ).current;

  const onContextCreate = useCallback(async (gl: any) => {
    const renderer = new Renderer({ gl });
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    renderer.setSize(w, h);
    renderer.setClearColor(0xf5f5f7);

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    cameraRef.current = camera;

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    // Floor
    const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.7 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    scene.add(floor);

    // Grid
    const maxDim = Math.max(roomW, roomD);
    const grid = new THREE.GridHelper(maxDim, Math.round(maxDim), 0xcccccc, 0xeeeeee);
    grid.position.y = 0.01;
    scene.add(grid);

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({
      color: 0xeeeeff,
      roughness: 0.5,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });

    const wallEdge = new THREE.EdgesGeometry(new THREE.PlaneGeometry(1, 1));
    const wallLineMat = new THREE.LineBasicMaterial({ color: 0xcccccc });

    function makeWall(wGeo: THREE.PlaneGeometry, px: number, py: number, pz: number, ry: number) {
      const wall = new THREE.Mesh(wGeo, wallMat);
      wall.position.set(px, py, pz);
      wall.rotation.y = ry;
      scene.add(wall);
      const edge = new THREE.LineSegments(wallEdge, wallLineMat);
      edge.position.copy(wall.position);
      edge.rotation.copy(wall.rotation);
      edge.scale.set(wGeo.parameters.width, wGeo.parameters.height, 1);
      scene.add(edge);
    }

    makeWall(new THREE.PlaneGeometry(roomW, wallH), 0, wallH / 2, -hd, 0);
    makeWall(new THREE.PlaneGeometry(roomD, wallH), -hw, wallH / 2, 0, Math.PI / 2);
    makeWall(new THREE.PlaneGeometry(roomD, wallH), hw, wallH / 2, 0, -Math.PI / 2);

    // Cubes group
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    cubeGroupRef.current = cubeGroup;

    // Initial cubes
    units.forEach((u) => addUnitCube(cubeGroup, u));

    const animate = () => {
      requestAnimationFrame(animate);

      const s = sphericalRef.current;
      const dist = Math.max(roomW, roomD) * 1.2 + 2;
      const cx = dist * Math.sin(s.phi) * Math.cos(s.theta);
      const cy = dist * Math.cos(s.phi) + wallH * 0.3;
      const cz = dist * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.set(cx, cy, cz);
      camera.lookAt(0, wallH * 0.2, 0);

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  }, [roomW, roomD, wallH, hw, hd, units]);

  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  useEffect(() => {
    if (!cubeGroupRef.current || !sceneRef.current) return;
    while (cubeGroupRef.current.children.length > 0) {
      cubeGroupRef.current.remove(cubeGroupRef.current.children[0]);
    }
    units.forEach((u) => addUnitCube(cubeGroupRef.current!, u));
  }, [units]);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} key={`${roomId}-${version}`} />
      <View style={styles.hint}>
        <Text style={styles.hintText}>
          {ratioX.toFixed(1)}×{ratioZ.toFixed(1)} 米 · 拖动旋转视角
        </Text>
      </View>
    </View>
  );
}

function addUnitCube(parent: THREE.Group, unit: StorageUnit) {
  const geo = new THREE.BoxGeometry(unit.scale_x, unit.scale_y, unit.scale_z);
  const mat = new THREE.MeshStandardMaterial({
    color: hexToColor(unit.color),
    roughness: 0.4,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(unit.pos_x, unit.pos_y + unit.scale_y / 2, unit.pos_z);

  const edges = new THREE.EdgesGeometry(geo);
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x888888 }));
  mesh.add(line);

  mesh.userData = { unitId: unit.id };
  parent.add(mesh);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  glView: {
    flex: 1,
  },
  hint: {
    position: 'absolute',
    bottom: 24,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: 20,
  },
  hintText: {
    fontSize: FontSize.xs,
    color: '#FFFFFF',
  },
});
