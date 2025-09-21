import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/record')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/record"!</div>
}
