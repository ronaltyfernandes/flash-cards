import { Button } from '../components/Button'
import { EmptyState } from '../components/EmptyState'
import { Screen } from '../components/Screen'

export default function NotFound({ title = 'Essa página sumiu', children, backTo = '/', backLabel = 'Voltar ao início' }) {
  return (
    <Screen>
      <EmptyState main title={title} action={<Button to={backTo}>{backLabel}</Button>}>
        {children ?? 'O endereço não existe ou o item foi apagado.'}
      </EmptyState>
    </Screen>
  )
}
