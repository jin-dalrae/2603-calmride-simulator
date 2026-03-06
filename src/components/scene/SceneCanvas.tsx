import { Canvas } from '@react-three/fiber'
import { MapControls } from '@react-three/drei'
import { EgoVehicle } from './EgoVehicle'
import { SurroundingAgent } from './SurroundingAgent'
import { RoadMap } from './RoadMap'
import { TrajectoryLine } from './TrajectoryLine'
import { IncidentMarker } from './IncidentMarker'
import { TrafficSignals } from './TrafficSignals'
import { useScenarioStore } from '../../store/useScenarioStore'
import { usePlaybackStore } from '../../store/usePlaybackStore'

export function SceneCanvas() {
  const scenario = useScenarioStore(s => s.currentScenario)
  const currentTime = usePlaybackStore(s => s.currentTime)

  return (
    <div style={{ width: '100%', height: '100%', background: '#1a1a2e' }}>
      <Canvas orthographic camera={{ zoom: 4, position: [0, 0, 100], near: 0.1, far: 1000 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[50, 50, 50]} intensity={0.8} />

        {/* Ground plane */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
          <planeGeometry args={[500, 500]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

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

        <MapControls enableRotate={false} />
      </Canvas>
    </div>
  )
}
