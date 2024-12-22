import { Fragment, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Menu } from '@headlessui/react'
import { usePopper } from 'react-popper'

export interface ContextMenuItem {
  label?: string
  icon?: React.ComponentType<any>
  onClick?: () => void
  danger?: boolean
  divider?: boolean
}

interface ContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
}

export function ContextMenu({ items, children }: ContextMenuProps) {
  const [referenceElement, setReferenceElement] = useState<HTMLDivElement | null>(null)
  const [popperElement, setPopperElement] = useState<HTMLDivElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const timeoutRef = useRef<number>()

  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: 'right-start',
    modifiers: [
      {
        name: 'offset',
        options: {
          offset: [0, 8],
        },
      },
      {
        name: 'preventOverflow',
        options: {
          padding: 8,
        },
      },
    ],
  })

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsOpen(true)
  }

  return (
    <Menu as={Fragment}>
      <div
        ref={setReferenceElement}
        onContextMenu={handleContextMenu}
        className="relative"
      >
        {children}

        {isOpen && createPortal(
          <div
            ref={setPopperElement}
            style={styles.popper}
            {...attributes.popper}
            className="z-50"
          >
            <Menu.Items
              static
              className="w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800"
            >
              <div className="py-1">
                {items.map((item, index) => (
                  <Fragment key={index}>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => {
                            item.onClick?.()
                            setIsOpen(false)
                          }}
                          className={`
                            ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}
                            ${item.danger ? 'text-red-600' : 'text-gray-700 dark:text-gray-200'}
                            group flex w-full items-center px-4 py-2 text-sm
                          `}
                        >
                          {item.icon && (
                            <item.icon
                              className="mr-3 h-5 w-5"
                              aria-hidden="true"
                            />
                          )}
                          {item.label}
                        </button>
                      )}
                    </Menu.Item>
                    {item.divider && (
                      <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                    )}
                  </Fragment>
                ))}
              </div>
            </Menu.Items>
          </div>,
          document.body
        )}
      </div>
    </Menu>
  )
} 