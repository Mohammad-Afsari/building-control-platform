import { useParams } from 'react-router'

export const ApplicationDetailPage = () => {
  const { id } = useParams<{ id: string }>()

  return (
    <main className="mx-auto max-w-205 px-7 pt-7.5 pb-20 max-sm:px-4.5 max-sm:pb-16">
      <h1 className="text-section leading-tight font-black tracking-tight text-heading">
        Application {id}
      </h1>
      <p className="mt-2 text-body-sm text-muted">Scaffold placeholder — application detail port pending.</p>
    </main>
  )
}
