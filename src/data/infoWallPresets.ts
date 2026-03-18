export type Vec3 = [number, number, number]

type TextBlock = {
  position: Vec3
  fontSize: number
  maxWidth?: number
  lineHeight?: number
}

type DividerBlock = {
  position: Vec3
  width: number
  height: number
}

type LinkStripLayout = {
  label: TextBlock
  container: {
    position: Vec3
  }
  button: {
    size: [number, number]
    gap: number
  }
  text: {
    offsetX: number
    fontSize: number
    maxWidth: number
  }
}

export type InfoWallLayout = {
  title: TextBlock
  artist: TextBlock
  period: TextBlock
  description: TextBlock
  rightTitle: TextBlock
  rightBody: TextBlock
  divider: DividerBlock
  links: LinkStripLayout
}

export const presetDefault: InfoWallLayout = {
  title: {
    position: [-1.22, 0.82, 0.015],
    fontSize: 0.115,
    maxWidth: 2.3,
  },
  artist: {
    position: [-1.22, 0.41, 0.015],
    fontSize: 0.046,
    maxWidth: 2.3,
  },
  period: {
    position: [-1.22, 0.21, 0.015],
    fontSize: 0.037,
    maxWidth: 2.3,
  },
  description: {
    position: [-1.22, -0.13, 0.015],
    fontSize: 0.041,
    maxWidth: 2.34,
    lineHeight: 1.58,
  },
  rightTitle: {
    position: [-1.22, -0.75, 0.015],
    fontSize: 0.043,
    maxWidth: 2.3,
  },
  rightBody: {
    position: [-1.22, -0.9, 0.015],
    fontSize: 0.034,
    maxWidth: 2.34,
    lineHeight: 1.55,
  },
  divider: {
    position: [0, 0.0, 0.015],
    width: 2.38,
    height: 0.008,
  },
  links: {
    label: {
      position: [-1.18, 0.11, 0.015],
      fontSize: 0.028,
      maxWidth: 0.5,
    },
    container: {
      position: [-0.74, 0, 0.02],
    },
    button: {
      size: [0.68, 0.18],
      gap: 0.88,
    },
    text: {
      offsetX: 0.16,
      fontSize: 0.032,
      maxWidth: 0.38,
    },
  },
}

export const presetSplit: InfoWallLayout = {
  title: {
    position: [-1.22, 0.82, 0.015],
    fontSize: 0.11,
    maxWidth: 1.15,
  },
  artist: {
    position: [-1.22, 0.40, 0.015],
    fontSize: 0.045,
    maxWidth: 1.15,
  },
  period: {
    position: [-1.22, 0.20, 0.015],
    fontSize: 0.036,
    maxWidth: 1.15,
  },
  description: {
    position: [-1.22, -0.12, 0.015],
    fontSize: 0.036,
    maxWidth: 1.1,
    lineHeight: 1.52,
  },
  rightTitle: {
    position: [0.18, 0.82, 0.015],
    fontSize: 0.045,
    maxWidth: 1.1,
  },
  rightBody: {
    position: [0.18, 0.63, 0.015],
    fontSize: 0.034,
    maxWidth: 1.1,
    lineHeight: 1.52,
  },
  divider: {
    position: [0, 0.0, 0.015],
    width: 0.008,
    height: 1.62,
  },
  links: {
    label: {
      position: [-1.18, 0.11, 0.015],
      fontSize: 0.028,
      maxWidth: 0.5,
    },
    container: {
      position: [-0.74, 0, 0.02],
    },
    button: {
      size: [0.68, 0.18],
      gap: 0.88,
    },
    text: {
      offsetX: 0.16,
      fontSize: 0.032,
      maxWidth: 0.38,
    },
  },
}

export const presetCompact: InfoWallLayout = {
  title: {
    position: [-1.22, 0.78, 0.015],
    fontSize: 0.10,
    maxWidth: 2.3,
  },
  artist: {
    position: [-1.22, 0.48, 0.015],
    fontSize: 0.042,
    maxWidth: 2.3,
  },
  period: {
    position: [-1.22, 0.30, 0.015],
    fontSize: 0.034,
    maxWidth: 2.3,
  },
  description: {
    position: [-1.22, 0.02, 0.015],
    fontSize: 0.036,
    maxWidth: 2.34,
    lineHeight: 1.5,
  },
  rightTitle: {
    position: [-1.22, -0.58, 0.015],
    fontSize: 0.04,
    maxWidth: 2.3,
  },
  rightBody: {
    position: [-1.22, -0.73, 0.015],
    fontSize: 0.032,
    maxWidth: 2.34,
    lineHeight: 1.5,
  },
  divider: {
    position: [0, 0.16, 0.015],
    width: 2.38,
    height: 0.008,
  },
  links: {
    label: {
      position: [-1.18, 0.11, 0.015],
      fontSize: 0.028,
      maxWidth: 0.5,
    },
    container: {
      position: [-0.74, 0, 0.02],
    },
    button: {
      size: [0.62, 0.18],
      gap: 0.78,
    },
    text: {
      offsetX: 0.13,
      fontSize: 0.03,
      maxWidth: 0.34,
    },
  },
}

export const infoWallPresets = {
  default: presetDefault,
  split: presetSplit,
  compact: presetCompact,
}

export type InfoWallPresetKey = keyof typeof infoWallPresets