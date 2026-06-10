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
  selectedUnitId: string | null;
  selectedUnitName?: string;
  onUnitSelect?: (unitId: string) => void;
}

function hexToColor(hex: string): THREE.Color {
  return new THREE.Color(hex);
}

export default function CubeDemo({ roomId, ratioX, ratioZ, units, selectedUnitId, selectedUnitName, onUnitSelect }: CubeDemoProps) {
  const isDraggingRef = useRef(false);
  const sphericalRef = useRef({ theta: 0, phi: Math.PI / 4 });
  const prevDxRef = useRef(0);
  const prevDyRef = useRef(0);
  const containerSizeRef = useRef({ width: 1, height: 1 });
  const tapOriginRef = useRef({ x: 0, y: 0 });
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const cubeGroupRef = useRef<THREE.Group | null>(null);
  const cubeMeshMapRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const selIdRef = useRef(selectedUnitId);
  selIdRef.current = selectedUnitId;

  const roomW = ratioX * BASE_UNIT;
  const roomD = ratioZ * BASE_UNIT;
  const wallH = BASE_UNIT * 1.5;
  const hw = roomW / 2;
  const hd = roomD / 2;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        isDraggingRef.current = true;
        prevDxRef.current = 0;
        prevDyRef.current = 0;
        tapOriginRef.current = {
          x: evt.nativeEvent.locationX ?? 0,
          y: evt.nativeEvent.locationY ?? 0,
        };
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
      onPanResponderRelease: (evt) => {
        const x = evt.nativeEvent.locationX ?? 0;
        const y = evt.nativeEvent.locationY ?? 0;
        const dx = Math.abs(x - tapOriginRef.current.x);
        const dy = Math.abs(y - tapOriginRef.current.y);
        if (dx < 5 && dy < 5) {
          runRaycaster(x, y);
        }
        isDraggingRef.current = false;
      },
    })
  ).current;

  function runRaycaster(x: number, y: number) {
    const cam = cameraRef.current;
    const map = cubeMeshMapRef.current;
    if (!cam || map.size === 0) return;
    const { width, height } = containerSizeRef.current;
    const ndcX = (x / width) * 2 - 1;
    const ndcY = -(y / height) * 2 + 1;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cam);
    const meshes = Array.from(map.values());
    const intersects = raycaster.intersectObjects(meshes);
    if (intersects.length > 0) {
      let obj: THREE.Object3D | null = intersects[0].object;
      while (obj) {
        if (obj.userData?.unitId) {
          onUnitSelect?.(obj.userData.unitId as string);
          return;
        }
        obj = obj.parent;
      }
    }
  }

  function rebuildCubes() {
    const group = cubeGroupRef.current;
    if (!group) return;
    while (group.children.length > 0) {
      group.remove(group.children[0]);
    }
    cubeMeshMapRef.current.clear();
    units.forEach((u) => {
      const mesh = addUnitCube(group, u);
      cubeMeshMapRef.current.set(u.id, mesh);
    });
    applyHighlight(selectedUnitId);
  }

  const onContextCreate = useCallback((gl: any) => {
    const renderer = new Renderer({ gl });
    const w = gl.drawingBufferWidth;
    const h = gl.drawingBufferHeight;
    renderer.setSize(w, h);
    renderer.setClearColor(0xf5f5f7);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    cameraRef.current = camera;

    const ambient = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambient);
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.9);
    dirLight.position.set(5, 10, 5);
    scene.add(dirLight);

    const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0xe8e8e0, roughness: 0.7 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    const maxDim = Math.max(roomW, roomD);
    const grid = new THREE.GridHelper(maxDim, Math.round(maxDim), 0xcccccc, 0xeeeeee);
    grid.position.y = 0.01;
    scene.add(grid);

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

    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    cubeGroupRef.current = cubeGroup;
    rebuildCubes();

    const animate = () => {
      requestAnimationFrame(animate);

      const s = sphericalRef.current;
      const dist = Math.max(roomW, roomD) * 1.2 + 2;
      const cx = dist * Math.sin(s.phi) * Math.cos(s.theta);
      const cy = dist * Math.cos(s.phi) + wallH * 0.3;
      const cz = dist * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.set(cx, cy, cz);
      camera.lookAt(0, wallH * 0.2, 0);

      applyHighlight(selIdRef.current);

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  }, [roomW, roomD, wallH, hw, hd]);

  function applyHighlight(unitId: string | null) {
    cubeMeshMapRef.current.forEach((mesh, id) => {
      const edge = mesh.children.find((c) => (c as THREE.LineSegments).isLineSegments) as THREE.LineSegments | undefined;
      if (edge) {
        (edge.material as THREE.LineBasicMaterial).color.set(id === unitId ? '#2D5BFF' : '#888888');
      }
    });
  }

  useEffect(() => {
    rebuildCubes();
  }, [units, selectedUnitId]);

  return (
    <View
      style={styles.container}
      {...panResponder.panHandlers}
      onLayout={(e) => {
        containerSizeRef.current = {
          width: e.nativeEvent.layout.width,
          height: e.nativeEvent.layout.height,
        };
      }}
    >
      <GLView style={styles.glView} onContextCreate={onContextCreate} key={roomId} />
      <View style={styles.hint}>
        <Text style={styles.hintText}>
          {selectedUnitName ? `已选中: ${selectedUnitName}` : `${ratioX.toFixed(1)}×${ratioZ.toFixed(1)} 米 · 点击方块编辑`}
        </Text>
      </View>
    </View>
  );
}

function addUnitCube(parent: THREE.Group, unit: StorageUnit): THREE.Mesh {
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
  return mesh;
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
