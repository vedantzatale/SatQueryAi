export const SATELLITE_IMAGES = {
  puneBefore: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="terrainBefore" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%231a221f"/>
        <stop offset="50%" stop-color="%23131715"/>
        <stop offset="100%" stop-color="%230d100e"/>
      </linearGradient>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(%23terrainBefore)"/>
    <rect width="100%" height="100%" fill="url(%23grid)"/>
    <!-- Agricultural / Unvegetated Fallow Parcels -->
    <polygon points="120,80 340,60 310,220 90,200" fill="%23222e28" stroke="%232e3d36" stroke-width="1"/>
    <polygon points="360,90 520,70 500,240 330,220" fill="%231e2823" stroke="%232a3831" stroke-width="1"/>
    <polygon points="540,100 720,120 700,270 520,250" fill="%2324322b" stroke="%2330423a" stroke-width="1"/>
    <polygon points="110,260 280,240 260,390 90,370" fill="%231d2621" stroke="%2328352e" stroke-width="1"/>
    <polygon points="300,270 480,250 460,410 280,390" fill="%2325342d" stroke="%2332453c" stroke-width="1"/>
    <!-- Sparse existing structures -->
    <rect x="140" y="420" width="180" height="130" fill="%23171717" stroke="%23262626" stroke-width="1"/>
    <rect x="560" y="320" width="160" height="180" fill="%231a1a1a" stroke="%23282828" stroke-width="1"/>
    <!-- Water feature / Drainage canal -->
    <path d="M 0 520 Q 250 480 500 560 T 800 500" fill="none" stroke="%230b1311" stroke-width="18"/>
    <!-- Grid Labels -->
    <text x="30" y="40" fill="%23555555" font-family="monospace" font-size="12">SENTINEL-2 MSI • 10M BANDS (B4,B3,B2) • 2024-01-12</text>
    <text x="30" y="570" fill="%23555555" font-family="monospace" font-size="11">AOI_PUNE_NORTH_SECTOR: 18.5204° N, 73.8567° E</text>
  </svg>`,

  puneAfter: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="terrainAfter" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23171c1a"/>
        <stop offset="50%" stop-color="%23121514"/>
        <stop offset="100%" stop-color="%230c0e0d"/>
      </linearGradient>
      <pattern id="gridAfter" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(%23terrainAfter)"/>
    <rect width="100%" height="100%" fill="url(%23gridAfter)"/>
    <!-- Preserved parcels -->
    <polygon points="560,110 740,130 720,280 540,260" fill="%23171717" stroke="%23262626" stroke-width="1"/>
    <rect x="140" y="420" width="180" height="130" fill="%23171717" stroke="%23262626" stroke-width="1"/>
    <rect x="560" y="320" width="160" height="180" fill="%231a1a1a" stroke="%23282828" stroke-width="1"/>
    <!-- Drainage canal -->
    <path d="M 0 520 Q 250 480 500 560 T 800 500" fill="none" stroke="%230b1311" stroke-width="18"/>
    <!-- NEW BUILT-UP COMMERCIAL/INDUSTRIAL ROOFS & STRUCTURES -->
    <!-- Large Logistics Center -->
    <polygon points="120,80 340,60 310,220 90,200" fill="%23262626" stroke="%23404040" stroke-width="1.5"/>
    <rect x="130" y="85" width="80" height="100" fill="%233a3a3a" stroke="%23555555" stroke-width="1"/>
    <rect x="220" y="80" width="80" height="110" fill="%23333333" stroke="%234d4d4d" stroke-width="1"/>
    <!-- Secondary Paved Yard -->
    <polygon points="360,90 520,70 500,240 330,220" fill="%23212121" stroke="%23383838" stroke-width="1.5"/>
    <rect x="350" y="100" width="130" height="110" fill="%23363636" stroke="%234f4f4f" stroke-width="1"/>
    <!-- New Access Asphalt Arterial Highway -->
    <path d="M 20 230 L 780 250" fill="none" stroke="%232f2f2f" stroke-width="8"/>
    <path d="M 20 230 L 780 250" fill="none" stroke="%23ffffff" stroke-width="1" stroke-dasharray="8,8" opacity="0.4"/>
    <!-- Grid Labels -->
    <text x="30" y="40" fill="%23888888" font-family="monospace" font-size="12">SENTINEL-2 MSI • 10M BANDS (B4,B3,B2) • 2025-01-18</text>
    <text x="30" y="570" fill="%23888888" font-family="monospace" font-size="11">AOI_PUNE_NORTH_SECTOR: 18.5204° N, 73.8567° E</text>
  </svg>`,

  puneChangeMask: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <pattern id="hatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="10" stroke="%23ffffff" stroke-width="1.5" opacity="0.6"/>
      </pattern>
    </defs>
    <!-- Darkened base scene -->
    <rect width="100%" height="100%" fill="%230a0a0a"/>
    <!-- Base outlines -->
    <polygon points="560,110 740,130 720,280 540,260" fill="%23171717" stroke="%23262626" stroke-width="1"/>
    <rect x="140" y="420" width="180" height="130" fill="%23171717" stroke="%23262626" stroke-width="1"/>
    <!-- HIGHLIGHTED DETECTED CHANGE REGION (Monochrome restrained outline + pattern) -->
    <polygon points="230,70 540,85 520,260 210,240" fill="rgba(255,255,255,0.15)" stroke="%23ffffff" stroke-width="2" stroke-dasharray="4,4"/>
    <polygon points="230,70 540,85 520,260 210,240" fill="url(%23hatch)"/>
    <!-- Bounding annotations -->
    <rect x="235" y="75" width="295" height="180" fill="none" stroke="%23ffffff" stroke-width="1" opacity="0.8"/>
    <!-- Label Tag -->
    <rect x="235" y="55" width="220" height="20" fill="%23ffffff"/>
    <text x="242" y="69" fill="%23000000" font-family="monospace" font-weight="bold" font-size="11">CHANGE: BUILT-UP EXPANSION (+12.4 ha)</text>
    <!-- Vector Corner Markers -->
    <path d="M 230 65 L 230 75 L 240 75" fill="none" stroke="%23ffffff" stroke-width="2"/>
    <path d="M 535 65 L 535 75 L 525 75" fill="none" stroke="%23ffffff" stroke-width="2"/>
    <path d="M 230 265 L 230 255 L 240 255" fill="none" stroke="%23ffffff" stroke-width="2"/>
    <path d="M 535 265 L 535 255 L 525 255" fill="none" stroke="%23ffffff" stroke-width="2"/>
    <!-- Legend -->
    <rect x="30" y="490" width="220" height="75" fill="%23171717" stroke="%23303030" rx="4"/>
    <text x="45" y="512" fill="%23ffffff" font-family="monospace" font-size="11" font-weight="bold">CHANGE DETECTION METRICS</text>
    <text x="45" y="530" fill="%23aaaaaa" font-family="monospace" font-size="10">Class: Veg → Impervious Surface</text>
    <text x="45" y="546" fill="%23aaaaaa" font-family="monospace" font-size="10">Net Expansion: 12.4 ha (±0.3 ha)</text>
  </svg>`,

  opticalCloudy: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <rect width="100%" height="100%" fill="%231a221f"/>
    <!-- Cloud formations covering 85% of terrain -->
    <path d="M 50 100 Q 200 40 400 120 T 750 90 Q 780 300 600 400 T 100 480 Z" fill="%23d8dad8" opacity="0.88" filter="blur(20px)"/>
    <path d="M 200 150 Q 350 80 550 170 T 700 350 Q 600 500 300 520 Z" fill="%23ffffff" opacity="0.95" filter="blur(15px)"/>
    <!-- Obscuration overlay notice -->
    <rect x="240" y="270" width="320" height="60" fill="%230d0d0d" stroke="%23333333" rx="6"/>
    <text x="400" y="295" fill="%23ffffff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">OPTICAL MULTISPECTRAL (S2)</text>
    <text x="400" y="315" fill="%23888888" font-family="monospace" font-size="11" text-anchor="middle">Cloud Obscuration: 88.4% • Surface Blocked</text>
  </svg>`,

  sarRadar: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <pattern id="speckle" width="20" height="20" patternUnits="userSpaceOnUse">
        <circle cx="2" cy="4" r="0.8" fill="%23ffffff" opacity="0.4"/>
        <circle cx="8" cy="14" r="1.2" fill="%23ffffff" opacity="0.7"/>
        <circle cx="15" cy="8" r="0.6" fill="%23ffffff" opacity="0.3"/>
        <circle cx="18" cy="18" r="1" fill="%23ffffff" opacity="0.5"/>
      </pattern>
      <radialGradient id="sarGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="%232c2c2c"/>
        <stop offset="100%" stop-color="%23111111"/>
      </radialGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(%23sarGrad)"/>
    <rect width="100%" height="100%" fill="url(%23speckle)"/>
    <!-- Specular Flooded Lowland (Low backscatter = dark black smooth water) -->
    <path d="M 120 180 Q 280 260 380 200 T 680 240 Q 640 460 390 490 T 140 410 Z" fill="%23050505" stroke="%23555555" stroke-width="1.5"/>
    <!-- High dielectric double bounce (Urban buildings = bright points) -->
    <rect x="520" y="100" width="180" height="110" fill="%23666666" opacity="0.8"/>
    <rect x="80" y="440" width="150" height="90" fill="%23666666" opacity="0.8"/>
    <!-- Radar Grid and Metadata -->
    <text x="30" y="40" fill="%23888888" font-family="monospace" font-size="12">SENTINEL-1 C-BAND SAR • VV+VH POLARIZATION</text>
    <text x="30" y="570" fill="%23777777" font-family="monospace" font-size="11">PENETRATES CLOUD COVER • CALIBRATED SIGMA0 (dB)</text>
    <rect x="230" y="490" width="340" height="60" fill="%23171717" stroke="%23303030" rx="4"/>
    <text x="400" y="515" fill="%23ffffff" font-family="monospace" font-size="11" font-weight="bold" text-anchor="middle">SAR SPECULAR WATER DETECTION: 410 ha</text>
    <text x="400" y="533" fill="%23aaaaaa" font-family="monospace" font-size="10" text-anchor="middle">Smooth open water backscatter: -22.4 dB (Flooded)</text>
  </svg>`,

  fusedMultimodal: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <pattern id="fusedGrid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="%23141816"/>
    <rect width="100%" height="100%" fill="url(%23fusedGrid)"/>
    <!-- Base terrain features -->
    <path d="M 0 300 Q 250 340 500 280 T 800 270" fill="none" stroke="%23222a25" stroke-width="24"/>
    <!-- Fused Flood Extent Polygon with High Contrast Annotation -->
    <path d="M 120 180 Q 280 260 380 200 T 680 240 Q 640 460 390 490 T 140 410 Z" fill="rgba(255, 255, 255, 0.12)" stroke="%23ffffff" stroke-width="2"/>
    <rect x="220" y="320" width="360" height="70" fill="%230d0d0d" stroke="%23444444" rx="6"/>
    <text x="400" y="348" fill="%23ffffff" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">OPTICAL + SAR FUSED WATERMASK</text>
    <text x="400" y="368" fill="%23a3a3a3" font-family="monospace" font-size="11" text-anchor="middle">410 ha Inundation Grounded in Topographic DEM</text>
    <!-- Corner coordinates -->
    <text x="30" y="40" fill="%23888888" font-family="monospace" font-size="12">TERRAMIND FUSED REPRESENTATION • LEVEL-3 DERIVATIVE</text>
    <text x="30" y="570" fill="%23777777" font-family="monospace" font-size="11">COREGISTERED ACCURACY: < 0.2 PIXELS • CONFIDENCE: 92%</text>
  </svg>`,

  heroSatelliteGrid: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
    <defs>
      <linearGradient id="heroDark" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="%23080a09"/>
        <stop offset="60%" stop-color="%23020202"/>
        <stop offset="100%" stop-color="%23000000"/>
      </linearGradient>
      <pattern id="utmGrid" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
        <circle cx="0" cy="0" r="1.5" fill="rgba(255,255,255,0.15)"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(%23heroDark)"/>
    <rect width="100%" height="100%" fill="url(%23utmGrid)"/>
    <!-- Topographic contour curves -->
    <path d="M 0 500 C 300 450 600 650 1200 480" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.2"/>
    <path d="M 0 560 C 320 510 620 710 1200 540" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1.2"/>
    <path d="M 0 620 C 340 570 640 770 1200 600" fill="none" stroke="rgba(255,255,255,0.04)" stroke-width="1.2"/>
    <!-- Sub-orbital track line -->
    <line x1="150" y1="50" x2="1050" y2="750" stroke="rgba(255,255,255,0.15)" stroke-width="1" stroke-dasharray="6,8"/>
    <!-- AOI Focus Box -->
    <rect x="420" y="240" width="360" height="280" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <text x="435" y="265" fill="%23888888" font-family="monospace" font-size="11">AOI_PRIMARY_TARGET: 18°31'N 73°51'E</text>
    <text x="435" y="500" fill="%23666666" font-family="monospace" font-size="10">SENTINEL-2 / SENTINEL-1 / LANDSAT-9</text>
  </svg>`
};
