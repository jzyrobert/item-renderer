import './App.css';
import React, { useState, useRef, Suspense } from 'react';
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import { Canvas, useLoader, extend, useThree, useFrame } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete'
import Items from './items.json';

const modelfolder = "FurnitureBaseModels"

function getFileName(item) {
  if (item === null) {
    return ""
  }
  return modelfolder + "/" + item.file + "/" + item.file + ".dae"
}

extend({ OrbitControls, TrackballControls })

function Item({ url }) {
  const collada = useLoader(ColladaLoader, url)
  const { camera } = useThree()
  return (
    <mesh scale={[1, 1, 1]}
      onAfterRender={() => {
        camera.lookAt(collada.scene.position)
      }}
    >
      <primitive object={collada.scene} dispose={null} />
    </mesh>
  )
}

function Scene({ url }) {
  const { camera, gl: { domElement } } = useThree()
  return (
    <>
      <Suspense fallback={null}>
        <Item url={url} />
      </Suspense>
      <orbitControls args={[camera, domElement]} enablePan={false} />
    </>
  )
}

function ModelViewer() {
  const [currentItem, setItem] = useState(null);

  return (
    <>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px"
      }}>
        <Autocomplete
          value={currentItem}
          onChange={(e, v) => setItem(v)}
          p={2}
          id="item-list"
          options={Items}
          getOptionLabel={(op) => op.name}
          style={{ width: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          renderInput={(params) => <TextField {...params} label="Item list" variant="outlined" />}
        />
      </div>
      {currentItem == null
        ? <div> Select an item!</div>
      : <Canvas style={{ flex: 1 }}>
          <ambientLight />
          <Scene url={getFileName(currentItem)} />
        </Canvas>
      }
    </>
  )
}

function App() {
  return (
    <div className="App">
      <ModelViewer />
    </div>
  )
}

export default App;
