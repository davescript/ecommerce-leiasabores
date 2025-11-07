import { Settings as SettingsIcon } from 'lucide-react'

export function Settings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Configurações</h2>
        <p className="text-gray-600 mt-1">Gerencie as configurações da loja</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <SettingsIcon className="w-6 h-6 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">Configurações Gerais</h3>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome da Loja
            </label>
            <input
              type="text"
              defaultValue="Leia Sabores"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email de Contato
            </label>
            <input
              type="email"
              defaultValue="contato@leiasabores.pt"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone
            </label>
            <input
              type="tel"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição da Loja
            </label>
            <textarea
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              defaultValue="Topos personalizados e bolos artesanais"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            <button className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Salvar Alterações
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

