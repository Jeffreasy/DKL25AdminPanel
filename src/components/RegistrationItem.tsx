import { useState } from 'react'
import { Card, Text, Badge, Button, Group, Stack, Divider, rem, useMantineTheme } from '@mantine/core'
import { IconCircleCheck, IconMailForward, IconUser, IconRoad, IconHandGrab } from '@tabler/icons-react'
import { updateAanmelding } from '../features/aanmeldingen/services/aanmeldingenService'
import type { Aanmelding } from '../features/aanmeldingen/types'
import type { ElementType } from 'react'

interface RegistrationItemProps {
  registration: Aanmelding
  onStatusUpdate: () => void
}

function DetailItem({ label, value, icon: Icon }: { label: string; value: string | number | null | undefined; icon: ElementType }) {
  return (
    <Group gap="xs" align="start">
      <Icon size={16} style={{ marginTop: rem(2) }} />
      <Stack gap={0}>
        <Text size="xs" c="dimmed">{label}</Text>
        <Text size="sm">{value || '-'}</Text>
      </Stack>
    </Group>
  )
}

export function RegistrationItem({ registration, onStatusUpdate }: RegistrationItemProps) {
  const [loading, setLoading] = useState(false)
  const theme = useMantineTheme()

  const handleEmailVerzonden = async () => {
    setLoading(true)
    try {
      const { error } = await updateAanmelding(registration.id, {
        email_verzonden: true,
        email_verzonden_op: new Date().toISOString()
      })
      if (error) {
        console.error('Error updating email status:', error)
      } else {
        onStatusUpdate()
      }
    } catch (err) {
      console.error('Error in handleEmailVerzonden:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
  }

  return (
    <Card 
      shadow="sm"
      padding="lg" 
      radius="md"
      withBorder
      w="100%"
    >
      <Stack gap="md">
        <Group justify="space-between" align="start">
          <Stack gap={0}>
            <Text fw={500} size="lg">{registration.naam}</Text>
            <Text size="sm" c="dimmed">
              {registration.email}
              {registration.telefoon && ` • ${registration.telefoon}`}
            </Text>
          </Stack>
          {registration.email_verzonden ? (
            <Badge
              color="green"
              variant="light"
              leftSection={<IconCircleCheck size={14} />}
              radius="sm"
            >
              Email verzonden
            </Badge>
          ) : (
            <Button
              variant="light"
              color="indigo"
              size="xs"
              onClick={handleEmailVerzonden}
              loading={loading}
              leftSection={<IconMailForward size={14} />}
              radius="sm"
            >
              Markeer als verzonden
            </Button>
          )}
        </Group>

        <Divider my="xs" />

        <Stack gap="sm">
          <DetailItem label="Rol" value={registration.rol} icon={IconUser} />
          <DetailItem label="Afstand" value={registration.afstand} icon={IconRoad} />
          <DetailItem label="Ondersteuning" value={registration.ondersteuning} icon={IconHandGrab} />
        </Stack>

        {registration.bijzonderheden && (
          <>
            <Divider my="xs" />
            <Stack gap={4}>
              <Text size="sm" fw={500} c="dimmed">Bijzonderheden</Text>
              <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                {registration.bijzonderheden}
              </Text>
            </Stack>
          </>
        )}

        {!registration.bijzonderheden && <Divider my="xs" />}
        <Group justify="space-between" mt="sm">
          <Text size="xs" c="dimmed">
            Aangemeld op: {formatDate(registration.created_at)}
          </Text>
          {registration.email_verzonden_op && (
            <Text size="xs" c="dimmed">
              Email verzonden op: {formatDate(registration.email_verzonden_op)}
            </Text>
          )}
        </Group>
      </Stack>
    </Card>
  )
} 