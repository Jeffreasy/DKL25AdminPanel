import { tv, type VariantProps } from 'tailwind-variants';

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

  // ADDED: Grid styles using tv
  grid: tv({
    base: 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4',
    // Potential variants could be added here later if needed, e.g., different column counts
  }),

  // ADDED: Form element styles using tv
  form: {
    label: tv({
      base: 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1',
    }),
    input: tv({
      base: 'block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm',
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
};

// Type helper for extracting props from tv functions
export type TVProps<T> = T extends (props: infer P) => any ? P : never;

// Helper function to apply styles, potentially useful for complex components
// export function applyStyles<T>(variantFn: (props?: TVProps<T>) => string, props?: TVProps<T>) {
//   return variantFn(props);
// } 