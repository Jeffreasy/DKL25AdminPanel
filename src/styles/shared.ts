// Utility functie voor conditional classes (als je die nog niet hebt)
export const cl = (...classes: (string | boolean | undefined)[]) => 
  classes.filter(Boolean).join(' ')

// Gedeelde component classes
export const componentClasses = {
  // Layout patterns
  card: "bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow",
  modal: {
    overlay: "fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4",
    container: "bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg shadow-xl",
    header: "px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center",
    body: "p-6",
    footer: "px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3"
  },
  grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4",
  
  // Item patterns
  listItem: {
    container: "p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors",
    content: "flex justify-between items-start gap-4",
    title: "font-medium text-gray-900 dark:text-white",
    subtitle: "text-sm text-gray-500 dark:text-gray-400",
    metadata: "mt-1 text-xs text-gray-500 dark:text-gray-400"
  },

  // Form patterns
  form: {
    group: "space-y-6",
    label: "block text-sm font-medium text-gray-700 dark:text-gray-300",
    input: "mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500",
    error: "mt-1 text-sm text-red-600 dark:text-red-400"
  },

  // Button patterns
  button: {
    primary: "px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900",
    secondary: "px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-900",
    icon: "p-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
  },

  // Image patterns
  image: {
    container: "aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden",
    fit: "w-full h-full object-cover"
  },

  sidebar: {
    container: "flex flex-col h-full bg-gray-800 dark:bg-gray-950 border-r border-gray-700 dark:border-gray-700 shadow-sm",
    header: {
      wrapper: "flex h-16 flex-shrink-0 items-center px-4 justify-between",
      logo: {
        base: "transition-all duration-300",
        collapsed: "w-8",
        expanded: "w-auto h-12"
      }
    },
    content: {
      wrapper: "flex-1 flex flex-col overflow-y-auto custom-scrollbar",
      section: "flex-shrink-0 px-2 py-4 space-y-1"
    },
    item: {
      base: "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200",
      active: "bg-gray-700 dark:bg-gray-800 text-white dark:text-white",
      inactive: "text-gray-300 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white",
      icon: {
        base: "mr-3 h-5 w-5 flex-shrink-0",
        inactive: "text-gray-400 dark:text-gray-500 group-hover:text-white dark:group-hover:text-gray-300"
      },
    },
    group: {
      header: "flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-300 dark:text-gray-300 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-white dark:hover:text-white rounded-md",
      expanded: "bg-gray-700 dark:bg-gray-800 text-white dark:text-white",
      items: "ml-4 space-y-1 mt-1"
    },
    resize: {
      handle: "absolute -right-1 top-0 bottom-0 w-2 cursor-col-resize hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors",
      active: "bg-indigo-500"
    }
  }
} 