import { Select as MantineSelect, SelectProps } from '@mantine/core'

export function Select(props: SelectProps) {
  return (
    <MantineSelect
      {...props}
      styles={(theme) => ({
        input: {
          '&:focus': {
            borderColor: theme.colors.indigo[5],
            boxShadow: `0 0 0 1px ${theme.colors.indigo[5]}`
          }
        },
        item: {
          '&[data-selected]': {
            '&, &:hover': {
              backgroundColor: theme.colors.indigo[5],
              color: theme.white
            }
          }
        }
      })}
    />
  )
}

export type { SelectProps } 