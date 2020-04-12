import './App.css';
import React, { useState, useRef, Suspense } from 'react';
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import { Canvas, useLoader, extend, useThree, useFrame } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete'
import Items from './items.json';

const modelfolder = "/FurnitureOutput"

function getFileName(item, body, fabric) {
  if (item === null) {
    return ""
  }
  if (body === "" && fabric === "") {
    return process.env.PUBLIC_URL + modelfolder + "/" + item.file + "/" + item.file + ".dae"
  }
  return process.env.PUBLIC_URL + modelfolder + "/" + item.file + "/" + body.slice(-5) + fabric.slice(-7) + ".dae"
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
  console.log(url)
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
  const [currentBody, setBody] = useState("");
  const [currentFabric, setFabric] = useState("");

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
          onChange={(e, v) => {
            setItem(v);
            if (v?.body_variations?.length > 0) {
              setBody(v.body_variations[0])
            } else {
              setBody("")
            }
            if (v?.fabric_variations?.length > 0) {
              setFabric(v.fabric_variations[0])
            } else {
              setFabric("")
            }
          }}
          p={2}
          id="item-list"
          options={Items}
          getOptionLabel={(op) => op.name}
          style={{ width: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          renderInput={(params) => <TextField {...params} label="Item list" variant="outlined" />}
        />
        {/* The body variation */}
        {
          currentItem != null && currentItem.body_variations.length > 0 &&
          <Autocomplete
          value={currentBody}
          onChange={(e, v) => setBody(v)}
          p={2}
          id="body-list"
          options={currentItem.body_variations}
          getOptionLabel={(op) => op.slice(-5)}
          style={{ width: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          renderInput={(params) => <TextField {...params} label="Body variation" variant="outlined" />}
        />
        }
        {/* The fabric variation */}
        {
          currentItem != null && currentItem.fabric_variations.length > 0 &&
          <Autocomplete
          value={currentFabric}
          onChange={(e, v) => setFabric(v)}
          p={2}
          id="fabric-list"
          options={currentItem.fabric_variations}
          getOptionLabel={(op) => op.slice(-7)}
          style={{ width: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
          renderInput={(params) => <TextField {...params} label="Fabric variation" variant="outlined" />}
        />
        }
      </div>
      {currentItem == null
        ? <div> Select an item!</div>
      : <Canvas style={{ flex: 1 }}>
          <ambientLight />
          <Scene url={getFileName(currentItem, currentBody, currentFabric)} />
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
