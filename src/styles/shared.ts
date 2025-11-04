import { tv } from 'tailwind-variants';

// Utility functie voor conditional classes (als je die nog niet hebt)
export const cl = (...classes: (string | boolean | undefined | null)[]) => 
  classes.filter(Boolean).join(' ')

/** Component Collections */
export const cc = {
  // Standard card layout used across the app
  card: tv({
    base: 'bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700',
  }),

  // Styles for list items, often used within cards or lists
  listItem: {
    container: tv({
      base: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm rounded-lg p-3 sm:p-4 flex items-center justify-between',
    }),
    content: tv({
      base: 'flex-1 min-w-0',
    }),
    title: tv({
      base: 'text-sm font-semibold text-gray-900 dark:text-white truncate',
    }),
    subtitle: tv({
      base: 'text-xs text-gray-500 dark:text-gray-400 truncate',
    }),
    action: tv({
      base: 'ml-2 sm:ml-4 flex-shrink-0',
    }),
  },

  // Button styles with variants
  button: {
    base: tv({
      base: 'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none',
      variants: {
        color: {
          primary:
            'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-600',
          secondary:
            'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 dark:focus:ring-gray-600 border border-gray-300 dark:border-gray-500',
          danger:
            'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-600',
          success:
            'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 dark:bg-green-500 dark:hover:bg-green-600 dark:focus:ring-green-600',
        },
        size: {
          sm: 'px-2.5 py-1 text-xs',
          md: 'px-3 py-1.5 text-sm',
          lg: 'px-4 py-2 text-base',
        },
      },
      defaultVariants: {
        color: 'primary',
        size: 'md',
      },
    }),
    icon: tv({
      base: 'inline-flex items-center justify-center rounded-md p-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none',
      variants: {
        color: {
          primary:
            'text-blue-600 hover:bg-blue-100 focus:ring-blue-500 dark:text-blue-400 dark:hover:bg-blue-900/50 dark:focus:ring-blue-600',
          secondary:
            'text-gray-500 hover:bg-gray-100 focus:ring-gray-500 dark:text-gray-400 dark:hover:bg-gray-700/50 dark:focus:ring-gray-600',
          danger:
            'text-red-600 hover:bg-red-100 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-900/50 dark:focus:ring-red-600',
        },
        size: {
          sm: 'p-1',
          md: 'p-1.5',
          lg: 'p-2',
        },
      },
      defaultVariants: {
        color: 'secondary',
        size: 'md',
      },
    }),
    iconDanger: tv({
      base: 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:pointer-events-none text-red-600 hover:bg-red-100 focus:ring-red-500 dark:text-red-400 dark:hover:bg-red-900/50 dark:focus:ring-red-600',
      variants: {
        size: {
          sm: 'p-1',
          md: 'p-1.5',
          lg: 'p-2',
        }
      },
       defaultVariants: {
        size: 'md',
      },
    }),
  },

  // Form element styles using tv
  form: {
    label: tv({
      base: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
    }),
    input: tv({
      base: 'block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
    }),
    textarea: tv({
      base: 'block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm resize-vertical',
    }),
    select: tv({
       base: 'block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-3 pr-10 py-2',
    }),
    error: tv({
      base: 'mt-1 text-sm text-red-600 dark:text-red-400'
    })
  },

  // Badge styles
  badge: tv({
    base: 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
    variants: {
      color: {
        gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
        green: 'bg-green-100 text-green-800 dark:bg-green-800/50 dark:text-green-300',
        blue: 'bg-blue-100 text-blue-800 dark:bg-blue-800/50 dark:text-blue-300',
        orange: 'bg-orange-100 text-orange-800 dark:bg-orange-800/50 dark:text-orange-300',
        red: 'bg-red-100 text-red-800 dark:bg-red-800/50 dark:text-red-300',
      },
    },
    defaultVariants: {
      color: 'gray',
    },
  }),

  // Alert styles
  alert: tv({
    base: 'rounded-md p-4 border flex items-start gap-3',
    variants: {
      status: {
        success: 'bg-green-50 border-green-400 text-green-800 dark:bg-green-900/30 dark:border-green-600/50 dark:text-green-300',
        error: 'bg-red-50 border-red-400 text-red-800 dark:bg-red-900/30 dark:border-red-600/50 dark:text-red-300',
        warning: 'bg-yellow-50 border-yellow-400 text-yellow-800 dark:bg-yellow-900/30 dark:border-yellow-600/50 dark:text-yellow-300',
        info: 'bg-blue-50 border-blue-400 text-blue-800 dark:bg-blue-900/30 dark:border-blue-600/50 dark:text-blue-300',
      },
    },
    defaultVariants: {
      status: 'info',
    },
  }),

  // Empty state styles
  emptyState: tv({
    base: 'text-center py-12 px-4',
  }),

  emptyStateIcon: tv({
    base: 'w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600',
  }),

  emptyStateTitle: tv({
    base: 'text-lg font-semibold text-gray-900 dark:text-white mb-2',
  }),

  emptyStateDescription: tv({
    base: 'text-gray-500 dark:text-gray-400',
  }),

  // Pagination styles
  pagination: {
    container: tv({
      base: 'flex items-center justify-between border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 sm:px-6 rounded-lg shadow-sm mt-4',
    }),
    button: tv({
      base: 'relative inline-flex items-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
    }),
    pageInfo: tv({
      base: 'text-sm text-gray-700 dark:text-gray-400 hidden sm:block',
    }),
    mobileContainer: tv({
      base: 'flex flex-1 justify-between sm:hidden',
    }),
    desktopContainer: tv({
      base: 'hidden sm:flex sm:flex-1 sm:items-center sm:justify-between',
    }),
    desktopNav: tv({
        base: 'relative z-0 inline-flex rounded-md shadow-sm -space-x-px',
    }),
    desktopButton: tv({
       base: 'relative inline-flex items-center px-3 py-1.5 border text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:z-20 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-600 dark:focus:border-blue-600',
       variants: {
        type: {
          arrow: 'rounded-md px-2',
          page: 'rounded-md'
        },
        active: {
            true: 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/50 dark:border-blue-600 dark:text-blue-300',
            false: 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
        }
       },
       defaultVariants: {
        active: false,
        type: 'page',
       }
    })
  },

  // Grid layout presets
  grid: {
    photos: tv({
      base: 'grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7',
    }),
    albums: tv({
      base: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    }),
    thumbnails: tv({
      base: 'grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8',
    }),
    stats: tv({
      base: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    }),
    compact: tv({
      base: 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
    }),
    recentPhotos: tv({
      base: 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6',
    }),
    photoOrderer: tv({
      base: 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8',
    }),
    // New presets for common patterns
    statsThree: tv({
      base: 'grid grid-cols-1 md:grid-cols-3',
    }),
    statsFour: tv({
      base: 'grid grid-cols-1 md:grid-cols-4',
    }),
    twoCol: tv({
      base: 'grid grid-cols-1 sm:grid-cols-2',
    }),
    threeCol: tv({
      base: 'grid grid-cols-1 sm:grid-cols-3',
    }),
    twoThree: tv({
      base: 'grid grid-cols-2 sm:grid-cols-3',
    }),
    twoFour: tv({
      base: 'grid grid-cols-2 sm:grid-cols-4',
    }),
    userCards: tv({
      base: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    }),
    permissions: tv({
      base: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    }),
    detailTwo: tv({
      base: 'grid grid-cols-2',
    }),
    responsive: tv({
      base: 'grid grid-cols-1 lg:grid-cols-2',
    }),
    formSix: tv({
      base: 'grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6',
    }),
  },

  // Transition presets
  transition: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
    slower: 'transition-all duration-500',
    colors: 'transition-colors duration-200',
    transform: 'transition-transform duration-200',
    opacity: 'transition-opacity duration-300',
    shadow: 'transition-shadow duration-200',
  },

  // Hover effect presets
  hover: {
    card: 'hover:shadow-md transition-shadow duration-200',
    cardLarge: 'hover:shadow-lg transition-shadow duration-200',
    scale: 'hover:scale-105 transition-transform duration-200',
    scaleButton: 'hover:scale-110 transition-all duration-200',
    fadeIn: 'opacity-0 group-hover:opacity-100 transition-opacity duration-300',
    fadeInFast: 'opacity-0 group-hover:opacity-100 transition-opacity duration-200',
    imageZoom: 'transition-transform duration-300 group-hover:scale-110',
  },

  // Overlay presets
  overlay: {
    light: 'bg-black/30 dark:bg-black/60',
    medium: 'bg-black/50 dark:bg-black/70',
    heavy: 'bg-black/70 dark:bg-black/80',
    gradient: {
      bottom: 'bg-gradient-to-t from-black/60 to-transparent',
      top: 'bg-gradient-to-b from-black/60 to-transparent',
      full: 'bg-gradient-to-t from-black/30 via-black/10 to-transparent',
    },
  },

  // Spacing presets
  spacing: {
    // Container padding
    container: {
      xs: 'p-2',
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    },
    // Section spacing
    section: {
      xs: 'space-y-2',
      sm: 'space-y-4',
      md: 'space-y-6',
      lg: 'space-y-8',
    },
    // Gap spacing
    gap: {
      xs: 'gap-1',
      sm: 'gap-2',
      md: 'gap-3',
      lg: 'gap-4',
      xl: 'gap-6',
    },
    // Padding variants
    px: {
      xs: 'px-2',
      sm: 'px-4',
      md: 'px-6',
      lg: 'px-8',
    },
    py: {
      xs: 'py-1',
      sm: 'py-2',
      md: 'py-3',
      lg: 'py-4',
      xl: 'py-6',
    },
  },
};

/** Chat Component Styles **/

export const chat = {
  // Chat message styles
  message: tv({
    base: 'group relative p-3 rounded-2xl max-w-[75%] break-words select-text',
    variants: {
      type: {
        own: 'bg-blue-500 text-white self-end rounded-br-md shadow-sm',
        other: 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 self-start rounded-bl-md shadow-sm border border-gray-200 dark:border-gray-700',
      },
      hasReaction: {
        true: 'mb-1',
        false: 'mb-3',
      }
    },
    defaultVariants: {
      type: 'other',
      hasReaction: false,
    }
  }),

  // Chat avatar styles
  avatar: tv({
    base: 'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
    variants: {
      userType: {
        own: 'bg-blue-500 text-white',
        other: 'bg-gray-500 text-white'
      }
    },
    defaultVariants: {
      userType: 'other'
    }
  }),

  // Chat input styles
  input: tv({
    base: 'flex-1 resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-3 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200',
    variants: {
      hasText: {
        true: 'pr-12',
        false: ''
      }
    }
  }),

  // Reaction button styles
  reaction: tv({
    base: 'inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full transition-all duration-200 hover:scale-105 cursor-pointer select-none',
    variants: {
      active: {
        true: 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300',
        false: 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
      }
    }
  }),

  // Chat sidebar styles
  sidebar: {
    channel: tv({
      base: 'w-full flex items-center gap-3 px-3 py-2 text-left text-sm rounded-xl transition-all duration-200 group',
      variants: {
        active: {
          true: 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50',
          false: 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
        }
      }
    }),
    channelIcon: tv({
      base: 'w-4 h-4 flex-shrink-0',
      variants: {
        type: {
          public: 'text-gray-400 group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400',
          private: 'text-gray-500 group-hover:text-gray-600 dark:text-gray-400 dark:group-hover:text-gray-300'
        }
      }
    })
  },

  // Online status indicator
  onlineIndicator: tv({
    base: 'w-3 h-3 rounded-full border-2 border-white dark:border-gray-900',
    variants: {
      status: {
        online: 'bg-green-500',
        offline: 'bg-gray-400',
        away: 'bg-yellow-500',
        busy: 'bg-red-500'
      }
    },
    defaultVariants: {
      status: 'offline'
    }
  }),

  // Typing indicator styles
  typing: tv({
    base: 'flex items-center gap-1 px-4 py-2 text-sm text-gray-500 dark:text-gray-400',
  }),

  // Invite modal styles
  inviteUserCard: tv({
    base: 'flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group',
  }),

  inviteUserAvatar: tv({
    base: 'w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm',
  }),

  inviteUserInfo: tv({
    base: 'flex-1 min-w-0 ml-3',
  }),

  inviteUserName: tv({
    base: 'font-medium text-gray-900 dark:text-white truncate',
  }),

  inviteUserEmail: tv({
    base: 'text-sm text-gray-500 dark:text-gray-400 truncate',
  }),

  inviteButton: tv({
    base: 'px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    variants: {
      variant: {
        invite: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        invited: 'bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50'
      }
    },
    defaultVariants: {
      variant: 'invite'
    }
  }),

  // Context menu styles
  contextMenu: tv({
    base: 'absolute right-0 z-50 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1',
  }),

  contextMenuItem: tv({
    base: 'w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors duration-150 cursor-pointer',
    variants: {
      variant: {
        danger: 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50',
        default: 'text-gray-700 dark:text-gray-300'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }),

  // Loading skeleton styles
  skeleton: tv({
    base: 'animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%]',
    variants: {
      rounded: {
        true: 'rounded-2xl',
        false: ''
      }
    }
  }),

  // Empty state styles
  emptyState: tv({
    base: 'text-center py-12 px-4',
  }),

  emptyStateIcon: tv({
    base: 'w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600',
  }),

  emptyStateTitle: tv({
    base: 'text-lg font-semibold text-gray-900 dark:text-white mb-2',
  }),

  emptyStateDescription: tv({
    base: 'text-gray-500 dark:text-gray-400',
  })
};

// Type helper for extracting props from tv functions
export type TVProps<T> = T extends (props: infer P) => string ? P : never;

// Helper function to apply styles, potentially useful for complex components
// export function applyStyles<T>(variantFn: (props?: TVProps<T>) => string, props?: TVProps<T>) {
//   return variantFn(props);
// }
