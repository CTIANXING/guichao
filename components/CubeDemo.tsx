import { useRef, useCallback } from 'react';
import { PanResponder, StyleSheet, Text, View } from 'react-native';
import { GLView } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { Colors, FontSize, FontWeight, Spacing } from '../constants/theme';

export default function CubeDemo() {
  const cubeRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const sphericalRef = useRef({ theta: 0, phi: Math.PI / 4 });
  const isDraggingRef = useRef(false);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        isDraggingRef.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isDraggingRef.current) return;
        const s = sphericalRef.current;
        s.theta -= gestureState.dx * 0.01;
        s.phi -= gestureState.dy * 0.01;
        s.phi = Math.max(0.1, Math.min(Math.PI / 2, s.phi));
      },
      onPanResponderRelease: () => {
        isDraggingRef.current = false;
      },
    })
  ).current;

  const onContextCreate = useCallback(async (gl: any) => {
    const renderer = new Renderer({ gl });
    const width = gl.drawingBufferWidth;
    const height = gl.drawingBufferHeight;
    renderer.setSize(width, height);
    renderer.setClearColor(0xf5f5f7);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambient);

    const directional = new THREE.DirectionalLight(0xffffff, 1.0);
    directional.position.set(5, 10, 5);
    scene.add(directional);

    const geometry = new THREE.BoxGeometry(1, 1, 1);
    const material = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2D5BFF'),
      roughness: 0.3,
      metalness: 0.1,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
    cubeRef.current = cube;

    const edges = new THREE.EdgesGeometry(geometry);
    const lineMat = new THREE.LineBasicMaterial({ color: 0x1a1a1a, linewidth: 1 });
    const wireframe = new THREE.LineSegments(edges, lineMat);
    cube.add(wireframe);

    const gridHelper = new THREE.GridHelper(8, 8, 0xcccccc, 0xeeeeee);
    gridHelper.position.y = -0.6;
    scene.add(gridHelper);

    const animate = () => {
      requestAnimationFrame(animate);

      const s = sphericalRef.current;
      const dist = 7;
      const camX = dist * Math.sin(s.phi) * Math.cos(s.theta);
      const camY = dist * Math.cos(s.phi);
      const camZ = dist * Math.sin(s.phi) * Math.sin(s.theta);
      camera.position.set(camX, camY, camZ);
      camera.lookAt(0, 0, 0);

      if (cubeRef.current) {
        cubeRef.current.rotation.y += 0.005;
      }

      renderer.render(scene, camera);
      gl.endFrameEXP();
    };
    animate();
  }, []);

  return (
    <View style={styles.container} {...panResponder.panHandlers}>
      <GLView style={styles.glView} onContextCreate={onContextCreate} />
      <View style={styles.hint}>
        <Text style={styles.hintText}>拖动旋转视角</Text>
      </View>
    </View>
  );
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
