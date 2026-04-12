'use client'

import { useState } from 'react'
import { firstImage } from '@/lib/parseImages'

interface Product {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number | null
  images: string
  stock: number
  status: string
  soldCount: number
  category?: { name: string } | null
}

interface Order {
  id: string
  status: string
  total: number
  createdAt: string
  user?: { name?: string | null; email?: string | null } | null
  items: Array<{ product: { name: string } | null }>
}

interface Vendor {
  id: string
  storeName: string
  slug: string
  logo?: string | null
  status: string
  rating: number
}

interface Props {
  vendor: Vendor
  products: Product[]
  totalRevenue: number
  totalOrders: number
  recentOrders: Order[]
}

const CATEGORIES = [
  'Groceries & Food', 'Electronics', 'Fashion & Clothing', 'Home & Garden',
  'Beauty & Health', 'Services', 'Toys & Games', 'Sports & Fitness',
  'Carnival & Culture', 'Urban Fashion', 'Rum & Spirits', 'Books & Stationery', 'Other'
]

const STATUS_OPTS = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED']

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export function VendorDashboardClient({ vendor, products, totalRevenue, totalOrders, recentOrders }: Props) {
  const [tab, setTab] = useState<'overview' | 'products' | 'orders'>('overview')
  const [productList, setProductList] = useState<Product[]>(products)
  const [orderList, setOrderList] = useState<Order[]>(recentOrders)

  // Product form state
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: '', price: '', comparePrice: '', stock: '', category: CATEGORIES[0],
    description: '', imageUrl: '', status: 'ACTIVE'
  })
  const [formSaving, setFormSaving] = useState(false)
  const [formError, setFormError] = useState('')

  function openAddForm() {
    setEditingProduct(null)
    setFormData({ name: '', price: '', comparePrice: '', stock: '', category: CATEGORIES[0], description: '', imageUrl: '', status: 'ACTIVE' })
    setFormError('')
    setShowForm(true)
  }

  function openEditForm(p: Product) {
    setEditingProduct(p)
    let imgUrl = ''
    try {
      const parsed = JSON.parse(p.images)
      imgUrl = Array.isArray(parsed) ? parsed[0] || '' : ''
    } catch { imgUrl = p.images?.startsWith('http') ? p.images : '' }
    setFormData({
      name: p.name,
      price: String(p.price),
      comparePrice: p.comparePrice ? String(p.comparePrice) : '',
      stock: String(p.stock),
      category: p.category?.name || CATEGORIES[0],
      description: '',
      imageUrl: imgUrl,
      status: p.status
    })
    setFormError('')
    setShowForm(true)
  }

  async function saveProduct() {
    if (!formData.name || !formData.price) { setFormError('Name and price are required'); return }
    setFormSaving(true)
    setFormError('')
    try {
      const payload = {
        name: formData.name,
        slug: slugify(formData.name) + '-' + Date.now(),
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        stock: parseInt(formData.stock) || 0,
        description: formData.description || formData.name,
        images: JSON.stringify(formData.imageUrl ? [formData.imageUrl] : []),
        status: formData.status,
        category: formData.category,
      }

      if (editingProduct) {
        const res = await fetch(`/api/vendor/products/${editingProduct.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Failed to update')
        const updated = await res.json()
        setProductList(pl => pl.map(p => p.id === editingProduct.id ? { ...p, ...updated } : p))
      } else {
        const res = await fetch('/api/vendor/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Failed to create')
        const created = await res.json()
        setProductList(pl => [created, ...pl])
      }
      setShowForm(false)
    } catch (err: any) {
      setFormError(err.message || 'Save failed')
    } finally {
      setFormSaving(false)
    }
  }

  async function deleteProduct(id: string) {
    if (!confirm('Archive this product?')) return
    try {
      await fetch(`/api/vendor/products/${id}`, { method: 'DELETE' })
      setProductList(pl => pl.filter(p => p.id !== id))
    } catch {}
  }

  async function updateOrderStatus(orderId: string, status: string) {
    try {
      await fetch(`/api/vendor/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      setOrderList(ol => ol.map(o => o.id === orderId ? { ...o, status } : o))
    } catch {}
  }

  const gold = '#C9A84C'
  const bg = '#0A0A0A'
  const card = '#111111'
  const text = '#F5F0E8'
  const muted = '#9A8F7A'
  const border = '#C9A84C33'

  return (
    <div style={{ minHeight: '100vh', background: bg, color: text, padding: '32px', maxWidth: '1100px' }}>
      {/* Header */}
      <div style={{ marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '26px', marginBottom: '4px' }}>{vendor.storeName}</h1>
          <p style={{ color: muted, fontSize: '13px' }}>Vendor Dashboard</p>
        </div>
        <a href={`/store/${vendor.slug}`} target="_blank" rel="noopener noreferrer"
          style={{ color: gold, fontSize: '13px', textDecoration: 'none', border: `1px solid ${gold}`, borderRadius: '8px', padding: '6px 14px' }}>
          View Storefront ↗
        </a>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '28px', borderBottom: `1px solid ${border}`, paddingBottom: '0' }}>
        {(['overview', 'products', 'orders'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            background: 'none', border: 'none', color: tab === t ? gold : muted,
            borderBottom: tab === t ? `2px solid ${gold}` : '2px solid transparent',
            marginBottom: '-1px', transition: 'color 0.15s', textTransform: 'capitalize'
          }}>
            {t === 'overview' ? 'Overview' : t === 'products' ? `Products (${productList.length})` : `Orders (${orderList.length})`}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
            {[
              { label: 'Total Products', value: productList.length, sub: 'Listed products' },
              { label: 'Total Orders', value: totalOrders, sub: 'All time' },
              { label: 'Total Revenue', value: `TTD $${Number(totalRevenue).toFixed(2)}`, sub: 'Gross sales' },
              { label: 'Store Rating', value: `${vendor.rating.toFixed(1)} / 5.0`, sub: 'Average rating' },
            ].map(stat => (
              <div key={stat.label} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '20px' }}>
                <p style={{ fontSize: '11px', color: muted, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>{stat.label}</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: gold, marginBottom: '4px' }}>{stat.value}</p>
                <p style={{ fontSize: '12px', color: muted }}>{stat.sub}</p>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '16px', fontWeight: '600' }}>Recent Orders</h2>
              <button onClick={() => setTab('orders')} style={{ color: gold, background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px' }}>View all →</button>
            </div>
            {orderList.length === 0 ? (
              <p style={{ padding: '24px', color: muted, textAlign: 'center' }}>No orders yet. Share your store to get started!</p>
            ) : (
              orderList.slice(0, 5).map(order => (
                <div key={order.id} style={{ padding: '12px 20px', borderBottom: `1px solid ${border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>{order.user?.name || 'Customer'}</p>
                    <p style={{ fontSize: '12px', color: muted }}>{order.items.slice(0, 2).map(i => i.product?.name).join(', ')}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '14px', fontWeight: 'bold', color: gold }}>TTD ${order.total?.toFixed(2)}</p>
                    <span style={{ fontSize: '11px', color: muted }}>{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* PRODUCTS TAB */}
      {tab === 'products' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600' }}>Your Products</h2>
            <button onClick={openAddForm} style={{
              background: gold, color: '#0A0A0A', border: 'none', borderRadius: '8px',
              padding: '8px 18px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'
            }}>+ Add Product</button>
          </div>

          {/* Product Form Modal */}
          {showForm && (
            <div style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 50,
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
            }}>
              <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                  <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', color: muted, cursor: 'pointer', fontSize: '20px' }}>×</button>
                </div>

                {formError && (
                  <div style={{ background: '#2a0000', border: '1px solid #8B2222', borderRadius: '8px', padding: '10px 14px', marginBottom: '16px', color: '#fca5a5', fontSize: '13px' }}>
                    {formError}
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '13px', color: muted, display: 'block', marginBottom: '5px' }}>Product Name *</label>
                    <input value={formData.name} onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. iPhone 15 Case"
                      style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px', color: text, fontSize: '14px', boxSizing: 'border-box' }} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '13px', color: muted, display: 'block', marginBottom: '5px' }}>Price (TTD) *</label>
                      <input type="number" step="0.01" value={formData.price} onChange={e => setFormData(f => ({ ...f, price: e.target.value }))}
                        placeholder="0.00"
                        style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px', color: text, fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', color: muted, display: 'block', marginBottom: '5px' }}>Compare Price (optional)</label>
                      <input type="number" step="0.01" value={formData.comparePrice} onChange={e => setFormData(f => ({ ...f, comparePrice: e.target.value }))}
                        placeholder="0.00"
                        style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px', color: text, fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '13px', color: muted, display: 'block', marginBottom: '5px' }}>Stock Quantity</label>
                      <input type="number" value={formData.stock} onChange={e => setFormData(f => ({ ...f, stock: e.target.value }))}
                        placeholder="0"
                        style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px', color: text, fontSize: '14px', boxSizing: 'border-box' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '13px', color: muted, display: 'block', marginBottom: '5px' }}>Status</label>
                      <select value={formData.status} onChange={e => setFormData(f => ({ ...f, status: e.target.value }))}
                        style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px', color: text, fontSize: '14px', boxSizing: 'border-box' }}>
                        <option value="ACTIVE">Active</option>
                        <option value="DRAFT">Draft</option>
                        <option value="OUT_OF_STOCK">Out of Stock</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', color: muted, display: 'block', marginBottom: '5px' }}>Category</label>
                    <select value={formData.category} onChange={e => setFormData(f => ({ ...f, category: e.target.value }))}
                      style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px', color: text, fontSize: '14px', boxSizing: 'border-box' }}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', color: muted, display: 'block', marginBottom: '5px' }}>Description</label>
                    <textarea value={formData.description} onChange={e => setFormData(f => ({ ...f, description: e.target.value }))}
                      placeholder="Describe your product..."
                      rows={3}
                      style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px', color: text, fontSize: '14px', boxSizing: 'border-box', resize: 'vertical' }} />
                  </div>

                  <div>
                    <label style={{ fontSize: '13px', color: muted, display: 'block', marginBottom: '5px' }}>Product Image URL</label>
                    <input type="url" value={formData.imageUrl} onChange={e => setFormData(f => ({ ...f, imageUrl: e.target.value }))}
                      placeholder="https://..."
                      style={{ width: '100%', background: '#1A1A1A', border: `1px solid ${border}`, borderRadius: '8px', padding: '10px 12px', color: text, fontSize: '14px', boxSizing: 'border-box' }} />
                    <p style={{ fontSize: '11px', color: muted, marginTop: '4px' }}>Paste any image URL from the web (Unsplash, product CDN, etc.)</p>
                    {formData.imageUrl && (
                      <img src={formData.imageUrl} alt="preview" style={{ marginTop: '8px', width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: `1px solid ${border}` }}
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                    <button onClick={() => setShowForm(false)} style={{
                      flex: 1, padding: '10px', border: `1px solid ${border}`, borderRadius: '8px',
                      background: 'none', color: muted, cursor: 'pointer', fontSize: '14px'
                    }}>Cancel</button>
                    <button onClick={saveProduct} disabled={formSaving} style={{
                      flex: 2, padding: '10px', background: gold, color: '#0A0A0A', border: 'none',
                      borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                      opacity: formSaving ? 0.7 : 1
                    }}>
                      {formSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Products Table */}
          {productList.length === 0 ? (
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
              <p style={{ color: muted }}>No products yet.</p>
              <button onClick={openAddForm} style={{ marginTop: '16px', background: gold, color: '#0A0A0A', border: 'none', borderRadius: '8px', padding: '10px 20px', cursor: 'pointer', fontWeight: '600' }}>
                Add Your First Product
              </button>
            </div>
          ) : (
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: `1px solid ${border}`, background: '#0f0f0f' }}>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: muted, fontWeight: '600', fontSize: '12px' }}>Product</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: muted, fontWeight: '600', fontSize: '12px' }}>Price</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: muted, fontWeight: '600', fontSize: '12px' }}>Stock</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: muted, fontWeight: '600', fontSize: '12px' }}>Status</th>
                      <th style={{ textAlign: 'left', padding: '12px 16px', color: muted, fontWeight: '600', fontSize: '12px' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productList.map(p => (
                      <tr key={p.id} style={{ borderBottom: `1px solid ${border}` }}>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <img src={firstImage(p.images)} alt={p.name}
                              style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px', background: '#1A1A1A' }}
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=100' }} />
                            <div>
                              <p style={{ fontWeight: '500', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</p>
                              <p style={{ fontSize: '11px', color: muted }}>{p.soldCount} sold</p>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: gold, fontWeight: '600' }}>TTD ${p.price.toFixed(2)}</td>
                        <td style={{ padding: '12px 16px', color: p.stock === 0 ? '#ef4444' : p.stock <= 5 ? '#f97316' : text }}>{p.stock}</td>
                        <td style={{ padding: '12px 16px' }}>
                          <span style={{
                            fontSize: '11px', padding: '3px 8px', borderRadius: '4px', fontWeight: '600',
                            background: p.status === 'ACTIVE' ? '#14532d' : '#1a1a1a',
                            color: p.status === 'ACTIVE' ? '#4ade80' : muted,
                            border: `1px solid ${p.status === 'ACTIVE' ? '#166534' : '#333'}`
                          }}>{p.status}</span>
                        </td>
                        <td style={{ padding: '12px 16px' }}>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => openEditForm(p)} style={{
                              fontSize: '12px', padding: '5px 10px', border: `1px solid ${border}`, borderRadius: '6px',
                              background: 'none', color: text, cursor: 'pointer'
                            }}>Edit</button>
                            <button onClick={() => deleteProduct(p.id)} style={{
                              fontSize: '12px', padding: '5px 10px', border: '1px solid #8B2222', borderRadius: '6px',
                              background: 'none', color: '#ef4444', cursor: 'pointer'
                            }}>Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ORDERS TAB */}
      {tab === 'orders' && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Orders</h2>
          {orderList.length === 0 ? (
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '48px', textAlign: 'center' }}>
              <p style={{ color: muted }}>No orders yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {orderList.map(order => (
                <div key={order.id} style={{ background: card, border: `1px solid ${border}`, borderRadius: '12px', padding: '16px 20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <span style={{ fontSize: '13px', fontWeight: '600', color: gold }}>#{order.id.slice(-8).toUpperCase()}</span>
                        <span style={{ fontSize: '12px', color: muted }}>· {order.user?.name || 'Customer'}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: muted, marginBottom: '4px' }}>
                        {order.items.slice(0, 3).map(i => i.product?.name).filter(Boolean).join(', ')}
                        {order.items.length > 3 ? ` +${order.items.length - 3} more` : ''}
                      </p>
                      <p style={{ fontSize: '15px', fontWeight: 'bold', color: text }}>TTD ${order.total?.toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <select
                        value={order.status}
                        onChange={e => updateOrderStatus(order.id, e.target.value)}
                        style={{
                          background: '#1A1A1A', border: `1px solid ${border}`, borderRadius: '8px',
                          padding: '6px 10px', color: text, fontSize: '13px', cursor: 'pointer'
                        }}>
                        {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
