import { CircularProgress } from '@mui/material'

export default function Loading() {
   return (
    <div className="flex flex-col items-center justify-center h-screen bg-white">
      <CircularProgress />
      <p className="mt-4 text-gray-600 text-lg animate-pulse">Inicializando aplicación...</p>
    </div>
  )
}
