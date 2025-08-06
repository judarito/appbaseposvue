import { supabase } from '../lib/supabase'
import type { PaginationOptions, PaginatedResponse, PaginatedService } from '../composables/usePagination'
import type { VentaChat, CreateVentaChatData, UpdateVentaChatData } from '../types'

export class VentasChatService implements PaginatedService<VentaChat> {
  private client = supabase
  private table = 'VentasChat'

  constructor() {
    // No necesario ya que importamos directamente el cliente
  }

  // Obtener ventas con paginación (método requerido por la interfaz)
  async getPaginated(options: PaginationOptions): Promise<PaginatedResponse<VentaChat>> {
    const { page, itemsPerPage, sortBy = 'created_at', sortOrder = 'desc', search } = options
    
    // Calcular offset para la paginación
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    // Construir query base
    let query = this.client
      .from(this.table)
      .select('*', { count: 'exact' })

    // Aplicar filtro de búsqueda si existe
    if (search && search.trim()) {
      query = query.or(`user.ilike.%${search.trim()}%,productomsj.ilike.%${search.trim()}%,comprador.ilike.%${search.trim()}%,estado.ilike.%${search.trim()}%`)
    }

    // Aplicar ordenamiento
    query = query.order(sortBy, { ascending: sortOrder === 'asc' })

    // Aplicar paginación
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      throw error
    }

    const total = count || 0
    const totalPages = Math.ceil(total / itemsPerPage)

    return {
      data: data || [],
      total,
      page,
      itemsPerPage,
      totalPages
    }
  }

  // Obtener todas las ventas (mantener para compatibilidad)
  async getAllVentas(): Promise<VentaChat[]> {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Obtener venta por ID
  async getVentaById(id: number): Promise<VentaChat | null> {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // No encontrado
      }
      throw error
    }
    return data
  }

  // Crear nueva venta (método requerido por la interfaz)
  async create(ventaData: CreateVentaChatData): Promise<VentaChat> {
    const { data, error } = await this.client
      .from(this.table)
      .insert({
        user: ventaData.user,
        productomsj: ventaData.productomsj,
        cantidad: ventaData.cantidad,
        preciounitario: ventaData.preciounitario,
        fecha: ventaData.fecha,
        comprador: ventaData.comprador,
        estado: ventaData.estado,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Actualizar venta (método requerido por la interfaz)
  async update(id: string, ventaData: UpdateVentaChatData): Promise<VentaChat> {
    const { data, error } = await this.client
      .from(this.table)
      .update(ventaData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  // Eliminar venta (método requerido por la interfaz)
  async delete(id: string): Promise<void> {
    const { error } = await this.client
      .from(this.table)
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  // Buscar ventas por usuario
  async searchVentasByUser(userName: string): Promise<VentaChat[]> {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .ilike('user', `%${userName}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Buscar ventas por estado
  async getVentasByEstado(estado: string): Promise<VentaChat[]> {
    const { data, error } = await this.client
      .from(this.table)
      .select('*')
      .eq('estado', estado)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  // Obtener estadísticas de ventas
  async getVentasStats(): Promise<{
    totalVentas: number,
    ventasPorPagar: number,
    ventasPagadas: number,
    totalNeto: number
  }> {
    const { data, error } = await this.client
      .from(this.table)
      .select('estado, totalneto')

    if (error) throw error

    const stats = {
      totalVentas: data?.length || 0,
      ventasPorPagar: data?.filter(v => v.estado === 'POR PAGAR').length || 0,
      ventasPagadas: data?.filter(v => v.estado === 'PAGADO').length || 0,
      totalNeto: data?.reduce((sum, v) => sum + (v.totalneto || 0), 0) || 0
    }

    return stats
  }

  // Métodos legacy para compatibilidad hacia atrás
  async getVentasPaginated(options: PaginationOptions): Promise<PaginatedResponse<VentaChat>> {
    return this.getPaginated(options)
  }

  async createVenta(ventaData: CreateVentaChatData): Promise<VentaChat> {
    return this.create(ventaData)
  }

  async updateVenta(id: string, ventaData: UpdateVentaChatData): Promise<VentaChat> {
    return this.update(id, ventaData)
  }

  async deleteVenta(id: string): Promise<void> {
    return this.delete(id)
  }
}

// Exportar instancia singleton
export const ventasChatService = new VentasChatService()

// Para compatibilidad con el sistema de paginación genérico
export const ventasChatServicePaginated = {
  getPaginated: (options: PaginationOptions) => ventasChatService.getPaginated(options),
  create: async (data: CreateVentaChatData) => {
    const result = await ventasChatService.create(data)
    return result
  },
  update: async (id: string, data: UpdateVentaChatData) => {
    const result = await ventasChatService.update(id, data)
    return result
  },
  delete: async (id: string) => {
    await ventasChatService.delete(id)
  }
}
