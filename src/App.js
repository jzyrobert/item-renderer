import './App.css';
import React, { useState, Suspense, useRef } from 'react';
import { ColladaLoader } from "three/examples/jsm/loaders/ColladaLoader";
import { Canvas, useLoader, extend, useThree } from 'react-three-fiber';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete'
import Items from './items.json';
import * as THREE from 'three'

const modelfolder = "/FurnitureOutput"
var currentItem = {};

function getFileName(item, body, fabric) {
  if (item === null) {
    return ""
  }
  if (body === null && fabric === null) {
    return process.env.PUBLIC_URL + modelfolder + "/" + item.file + "/" + item.file + ".dae"
  }
  var variationName = ""
  if (body !== null) {
    variationName += body.file.slice(-5)
  }
  if (fabric !== null) {
    variationName += fabric.file.slice(-7)
  }
  return process.env.PUBLIC_URL + modelfolder + "/" + item.file + "/" + variationName + ".dae"
}

extend({ OrbitControls, TrackballControls })

function Item({ url }) {
  const collada = useLoader(ColladaLoader, url)
  var box = new THREE.Box3().setFromObject(collada.scene);
  var height = box.max.y - box.min.y;
  const width = box.max.x - box.min.x
  const target = 5
  const yscale = target / height
  const xscale = target / width
  const scaling = Math.min(1, Math.min(yscale, xscale))
  // Center the object
  const ymove = scaling * height / 2
  return (
    <mesh scale={[scaling, scaling, scaling]}
    position={[0, -ymove, 0]}
    >
      <primitive object={collada.scene} dispose={null} />
    </mesh>
  )
}

function Scene({ url, hasChanged }) {
  const { camera, gl: { domElement } } = useThree()
  if (hasChanged) {
    camera.position.set(0, 0, 5)
    camera.rotation.set(0, 0, 0)
  }
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
  const [currentBody, setBody] = useState(null);
  const [currentFabric, setFabric] = useState(null);
  const [itemChanged, setItemChanged] = useState(false);
  return (
    <>
      <div style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "10px"
      }}>
        <Autocomplete
          disableClearable={true}
          value={currentItem}
          onChange={(e, v) => {
            setItemChanged(v !== currentItem)
            setItem(v);
            if (v?.body_variations?.length > 0) {
              setBody(v.body_variations[0])
            } else {
              setBody(null)
            }
            if (v?.fabric_variations?.length > 0) {
              setFabric(v.fabric_variations[0])
            } else {
              setFabric(null)
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
            disableClearable={true}
            value={currentBody}
            onChange={(e, v) => {
              setItemChanged(false)
              setBody(v)
            }}
            p={2}
            id="body-list"
            options={currentItem.body_variations}
            getOptionLabel={(op) => op.name}
            style={{ width: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            renderInput={(params) => <TextField {...params} label="Body variation" variant="outlined" />}
          />
        }
        {/* The fabric variation */}
        {
          currentItem != null && currentItem.fabric_variations.length > 0 &&
          <Autocomplete
            disableClearable={true}
            value={currentFabric}
            onChange={(e, v) => {
              setItemChanged(false)
              setFabric(v)
            }}
            p={2}
            id="fabric-list"
            options={currentItem.fabric_variations}
            getOptionLabel={(op) => op.name}
            style={{ width: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}
            renderInput={(params) => <TextField {...params} label="Fabric variation" variant="outlined" />}
          />
        }
      </div>
      {currentItem == null
        ? <div> Select an item!</div>
        : <Canvas style={{ flex: 1 }}>
          <ambientLight />
          <Scene hasChanged={itemChanged} url={getFileName(currentItem, currentBody, currentFabric)} />
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
