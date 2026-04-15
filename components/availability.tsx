"use client"

import { useEffect, useRef, useState } from "react"
import {
  ComposableMap,
  Geographies,
  Geography,
} from "react-simple-maps"

const GEO_URL =
  "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json"

// Mongolia is the hub
const HUB: [number, number] = [103.8467, 46.8625]

// Destination countries [lon, lat]
const DESTINATIONS: { id: number; label: string; coords: [number, number]; avatar: string }[] = [
  { id: 1,  label: "New York",     coords: [-74.006,   40.7128], avatar: "/avatars/avatar-1.jpg" },
  { id: 2,  label: "London",       coords: [-0.1276,   51.5074], avatar: "/avatars/avatar-2.jpg" },
  { id: 3,  label: "Paris",        coords: [2.3522,    48.8566], avatar: "/avatars/avatar-3.jpg" },
  { id: 4,  label: "Dubai",        coords: [55.2708,   25.2048], avatar: "/avatars/avatar-4.jpg" },
  { id: 5,  label: "Tokyo",        coords: [139.6917,  35.6895], avatar: "/avatars/avatar-5.jpg" },
  { id: 6,  label: "Sydney",       coords: [151.2093, -33.8688], avatar: "/avatars/avatar-1.jpg" },
  { id: 7,  label: "Nairobi",      coords: [36.8219,   -1.2921], avatar: "/avatars/avatar-2.jpg" },
  { id: 8,  label: "São Paulo",    coords: [-46.6333, -23.5505], avatar: "/avatars/avatar-3.jpg" },
  { id: 9,  label: "Mumbai",       coords: [72.8777,   19.076],  avatar: "/avatars/avatar-4.jpg" },
  { id: 10, label: "Seoul",        coords: [126.978,   37.5665], avatar: "/avatars/avatar-5.jpg" },
  { id: 11, label: "Cairo",        coords: [31.2357,   30.0444], avatar: "/avatars/avatar-1.jpg" },
  { id: 12, label: "Los Angeles",  coords: [-118.2437, 34.0522], avatar: "/avatars/avatar-2.jpg" },
]

const ARC_DURATION = 1.8 // seconds per loop cycle
const DASH_LEN = 18       // bright dash length
const GAP_LEN  = 55       // gap between dashes
const PERIOD   = DASH_LEN + GAP_LEN // full repeat unit = 73px

function useProjection(width: number, height: number) {
  // Match react-simple-maps geoMercator projection manually for arc overlays
  const scale = width / 6.28
  const centerLon = 20
  const centerLat = 15

  const project = (lon: number, lat: number): [number, number] => {
    const lambda = ((lon - centerLon) * Math.PI) / 180
    const phi = (lat * Math.PI) / 180
    const x = width / 2 + scale * lambda
    const mercY = Math.log(Math.tan(Math.PI / 4 + phi / 2))
    const centerMercY = Math.log(Math.tan(Math.PI / 4 + ((centerLat * Math.PI) / 180) / 2))
    const y = height / 2 - scale * (mercY - centerMercY)
    return [x, y]
  }

  return project
}

// Quadratic bezier arc path – arc upward for visual clarity
function buildArcPath(x1: number, y1: number, x2: number, y2: number): string {
  const mx = (x1 + x2) / 2
  const dist = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
  const bend = dist * 0.28
  const my = Math.min(y1, y2) - bend
  return `M ${x1},${y1} Q ${mx},${my} ${x2},${y2}`
}

// Approximate path length for stroke-dasharray
function approxPathLen(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) * 1.2
}

export function Availability() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 900, height: 480 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const w = containerRef.current.offsetWidth
        const h = Math.round(w * 0.53)
        setDims({ width: w, height: h })
      }
    }
    update()
    setMounted(true)
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const project = useProjection(dims.width, dims.height)
  const [hubX, hubY] = project(HUB[0], HUB[1])

  return (
    <section className="py-24 px-4 bg-background">
      <div className="max-w-7xl mx-auto text-center">
        {/* Badge */}
        <span className="inline-block border border-border rounded-full px-4 py-1 text-sm text-foreground font-medium mb-6">
          Хамрах хүрээ
        </span>

        <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4 text-balance text-slate-700">
          Дэлхийн хаанаас ч хамтарч ажиллах боломжтой
        </h2>
        <p className="text-muted-foreground text-base max-w-md mx-auto mb-14 leading-relaxed">
          Бодь Групп нь хил хязгаар, цагийн бүснээс үл хамааран хамтын ажиллагааг дэмждэг.
        </p>

        {/* Map container */}
        <div ref={containerRef} className="relative w-full select-none">
          {/* Base geographic map */}
          <ComposableMap
            width={dims.width}
            height={dims.height}
            projection="geoMercator"
            projectionConfig={{ scale: dims.width / 6.28, center: [20, 15] }}
            style={{ width: "100%", height: "auto", display: "block" }}
          >
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#e8eaed"
                    stroke="#d1d5db"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: "none" },
                      hover:   { outline: "none", fill: "#e8eaed" },
                      pressed: { outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>

            {/* Mongolia highlight */}
            <Geographies geography={GEO_URL}>
              {({ geographies }: { geographies: any[] }) =>
                geographies
                  .filter((geo) => geo.properties.name === "Mongolia")
                  .map((geo) => (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      fill="#99f6e4"
                      stroke="#2dd4bf"
                      strokeWidth={1}
                      style={{
                        default: { outline: "none" },
                        hover:   { outline: "none" },
                        pressed: { outline: "none" },
                      }}
                    />
                  ))
              }
            </Geographies>

            {/* Animated arc lines + avatar markers as SVG overlay */}
            {mounted && (
              <g>
                {/* Arc lines */}
                {DESTINATIONS.map((dest, i) => {
                  const [dx, dy] = project(dest.coords[0], dest.coords[1])
                  const d = buildArcPath(hubX, hubY, dx, dy)
                  const len = approxPathLen(hubX, hubY, dx, dy)
                  const delay = (i * 0.18).toFixed(2)

                  return (
                    <path
                      key={`arc-${dest.id}`}
                      d={d}
                      fill="none"
                      stroke="#22d3ee"
                      strokeWidth={1.8}
                      strokeLinecap="round"
                      opacity={0.85}
                      style={{
                        strokeDasharray: `${DASH_LEN} ${GAP_LEN}`,
                        animation: `dashFlow ${ARC_DURATION}s linear ${delay}s infinite`,
                      }}
                    />
                  )
                })}

                {/* Static faint full arcs */}
                {DESTINATIONS.map((dest, i) => {
                  const [dx, dy] = project(dest.coords[0], dest.coords[1])
                  const d = buildArcPath(hubX, hubY, dx, dy)
                  return (
                    <path
                      key={`arc-bg-${dest.id}`}
                      d={d}
                      fill="none"
                      stroke="#bae6fd"
                      strokeWidth={0.8}
                      strokeLinecap="round"
                      opacity={0.45}
                    />
                  )
                })}

                {/* Hub pulse ring */}
                <circle cx={hubX} cy={hubY} r={10} fill="#14b8a6" opacity={0.18}>
                  <animate attributeName="r" from="8" to="22" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.35" to="0" dur="2s" repeatCount="indefinite" />
                </circle>
                <circle cx={hubX} cy={hubY} r={6} fill="#0d9488" />
                <circle cx={hubX} cy={hubY} r={3.5} fill="white" />

                {/* Destination avatar pins */}
                {DESTINATIONS.map((dest) => {
                  const [dx, dy] = project(dest.coords[0], dest.coords[1])
                  return (
                    <g key={`pin-${dest.id}`}>
                      <defs>
                        <clipPath id={`clip-avail-${dest.id}`}>
                          <circle cx={dx} cy={dy} r={11} />
                        </clipPath>
                      </defs>
                      <circle cx={dx} cy={dy} r={13} fill="white" opacity={0.9} />
                      <circle cx={dx} cy={dy} r={12} fill="white" stroke="#d1d5db" strokeWidth={0.8} />
                      <image
                        href={dest.avatar}
                        x={dx - 11}
                        y={dy - 11}
                        width={22}
                        height={22}
                        clipPath={`url(#clip-avail-${dest.id})`}
                        preserveAspectRatio="xMidYMid slice"
                      />
                    </g>
                  )
                })}
              </g>
            )}
          </ComposableMap>
        </div>

        {/* Animation keyframes injected as a style tag */}
        <style>{`
          @keyframes dashFlow {
            0%   { stroke-dashoffset: 0; }
            100% { stroke-dashoffset: -${PERIOD}px; }
          }
        `}</style>

        {/* Stat */}
        {/* <div className="mt-10">
          <p className="text-5xl font-bold text-primary">23,000+</p>
          <p className="text-muted-foreground mt-2 text-base">Happy customers worldwide</p>
        </div> */}
      </div>
    </section>
  )
}
