import { Canvas } from '@react-three/fiber'
import { MapControls, Sky, Environment, ContactShadows, Float } from '@react-three/drei'
import { EgoVehicle } from './EgoVehicle'
import { SurroundingAgent } from './SurroundingAgent'
import { RoadMap } from './RoadMap'
import { TrajectoryLine } from './TrajectoryLine'
import { IncidentMarker } from './IncidentMarker'
import { TrafficSignals } from './TrafficSignals'
import { useScenarioStore } from '../../store/useScenarioStore'
import { usePlaybackStore } from '../../store/usePlaybackStore'
import * as THREE from 'three'

export function SceneCanvas() {
  const scenario = useScenarioStore(s => s.currentScenario)
  const currentTime = usePlaybackStore(s => s.currentTime)

  return (
    <div style={{ width: '100%', height: '100%', background: '#050505' }}>
      <Canvas 
        shadows 
        camera={{ position: [20, 20, 20], fov: 40, near: 1, far: 2000 }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.outputColorSpace = THREE.SRGBColorSpace
        }}
      >
        <color attach="background" args={['#050505']} />
        <fog attach="fog" args={['#050505', 10, 500]} />
        
        <Sky sunPosition={[100, 20, 100]} />
        <Environment preset="city" />
        
        <ambientLight intensity={0.2} />
        <directionalLight 
          position={[100, 100, 50]} 
          intensity={1.5} 
          castShadow 
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-100}
          shadow-camera-right={100}
          shadow-camera-top={100}
          shadow-camera-bottom={-100}
        />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
          <planeGeometry args={[2000, 2000]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.8} metalness={0.2} />
        </mesh>
        
        <gridHelper args={[2000, 100, '#222', '#111']} position={[0, 0.01, 0]} />

        {scenario && (
          <>
            <RoadMap features={scenario.mapFeatures} />
            <TrafficSignals signals={scenario.trafficSignals} time={currentTime} />

            {scenario.agents.map(agent => (
              agent.id === scenario.egoId ? (
                <EgoVehicle key={agent.id} agent={agent} time={currentTime} />
              ) : (
                <SurroundingAgent key={agent.id} agent={agent} time={currentTime} />
              )
            ))}

            {scenario.agents.map(agent => (
              <TrajectoryLine key={`traj-${agent.id}`} agent={agent} currentTime={currentTime} />
            ))}

            {scenario.incidents
              .filter(inc => inc.timestamp <= currentTime)
              .map(inc => (
                <IncidentMarker key={inc.id} incident={inc} />
              ))}
          </>
        )}

        <MapControls 
          enableDamping 
          dampingFactor={0.05}
          maxPolarAngle={Math.PI / 2.1} 
        />
      </Canvas>
    </div>
  )
}
