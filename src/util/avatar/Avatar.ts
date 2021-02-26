import * as THREE from "three";

const Vector3 = THREE.Vector3;

function applyMesh(obj: THREE.Mesh, mesh: THREE.Geometry) {
  const geom = obj.geometry as THREE.BufferGeometry;

  // geom.setAttribute("position", new THREE.BufferAttribute(mesh.vertices, 3));
}
