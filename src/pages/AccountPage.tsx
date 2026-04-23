import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Address, Order } from '../types/auth';
import { getAddresses, getOrders } from '../services/authService';
import { formatPrice } from '../utils/format';
import Button from '../components/Button';
import { createAddress, deleteAddress, updateAddress } from '../services/authService';

export default function AccountPage() {
  const { user, logout } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', phone: '', addressLine: '', city: '', country: '', isDefault: false
  });

  const fetchData = async () => {
    try {
      const [addrData, orderData] = await Promise.all([
        getAddresses(),
        getOrders()
      ]);
      setAddresses(addrData);
      setOrders(orderData);
    } catch (err) {
      console.error('Failed to fetch account data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAddress(formData);
      setShowAddressForm(false);
      setFormData({ fullName: '', phone: '', addressLine: '', city: '', country: '', isDefault: false });
      fetchData();
    } catch (err) {
      console.error('Failed to create address', err);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await deleteAddress(id);
      fetchData();
    } catch (err) {
      console.error('Failed to delete address', err);
    }
  };

  const handleSetDefault = async (addr: Address) => {
    try {
      await updateAddress(addr.id, { ...addr, isDefault: true });
      fetchData();
    } catch (err) {
      console.error('Failed to update address', err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-32 pb-24 px-6 animate-fade-in-up">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="flex justify-between items-end border-b border-black/10 pb-6">
          <div>
            <h1 className="text-3xl font-serif text-textMain mb-2">My Account</h1>
            <p className="text-textLight">Welcome back, {user?.firstName}!</p>
          </div>
          <button 
            onClick={logout}
            className="text-xs uppercase tracking-widest font-semibold text-textLight hover:text-red-500 transition-colors"
          >
            Sign Out
          </button>
        </div>

        <section>
          <h2 className="text-xl font-serif text-textMain mb-4">Profile Information</h2>
          <div className="bg-white p-6 rounded-2xl border border-black/5 flex justify-between items-center">
            <div>
              <p className="font-medium text-textMain">{user?.firstName} {user?.lastName}</p>
              <p className="text-sm text-textLight">{user?.email}</p>
              {user?.phone && <p className="text-sm text-textLight">{user?.phone}</p>}
              {!user?.isEmailVerified && (
                <p className="text-xs text-red-500 mt-2 font-medium">Email not verified</p>
              )}
            </div>
            <Button className="px-4 py-2 text-xs uppercase tracking-widest bg-black/5 text-textMain hover:bg-black/10">
              Edit
            </Button>
          </div>
        </section>

        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-serif text-textMain">Saved Addresses</h2>
            <Button 
              onClick={() => setShowAddressForm(!showAddressForm)}
              className="px-4 py-2 text-xs uppercase tracking-widest bg-brand text-white hover:opacity-90"
            >
              {showAddressForm ? 'Cancel' : 'Add New'}
            </Button>
          </div>

          {showAddressForm && (
            <form onSubmit={handleAddressSubmit} className="bg-white p-6 rounded-2xl border border-black/5 mb-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input required placeholder="Full Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-brand/40" />
                <input required placeholder="Phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-brand/40" />
                <input required placeholder="Address Line" value={formData.addressLine} onChange={e => setFormData({...formData, addressLine: e.target.value})} className="col-span-1 sm:col-span-2 px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-brand/40" />
                <input required placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-brand/40" />
                <input required placeholder="Country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} className="px-4 py-3 rounded-xl border border-black/10 focus:ring-2 focus:ring-brand/40" />
              </div>
              <label className="flex items-center gap-2 text-sm text-textMain">
                <input type="checkbox" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} className="rounded text-brand focus:ring-brand/40" />
                Set as default address
              </label>
              <Button type="submit" className="w-full sm:w-auto px-8 py-3 bg-brand text-white text-xs uppercase tracking-widest font-semibold hover:opacity-90">
                Save Address
              </Button>
            </form>
          )}

          {addresses.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-black/5 text-center text-textLight">
              No saved addresses found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div key={addr.id} className="bg-white p-6 rounded-2xl border border-black/5 relative group">
                  {addr.isDefault && (
                    <span className="absolute top-4 right-4 bg-brand/10 text-brand text-[10px] uppercase tracking-wider px-2 py-1 rounded font-semibold">
                      Default
                    </span>
                  )}
                  <p className="font-medium text-textMain mb-1">{addr.fullName}</p>
                  <p className="text-sm text-textLight">{addr.addressLine}</p>
                  <p className="text-sm text-textLight">{addr.city}, {addr.country}</p>
                  <p className="text-sm text-textLight mt-2">{addr.phone}</p>
                  
                  <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-xs text-red-500 hover:underline">Delete</button>
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr)} className="text-xs text-brand hover:underline">Set Default</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-xl font-serif text-textMain mb-4">Order History</h2>
          {orders.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-black/5 text-center text-textLight">
              You haven't placed any orders yet.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 rounded-2xl border border-black/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <p className="font-medium text-textMain">Order #{order.id}</p>
                    <p className="text-sm text-textLight">{new Date(order.createdAt).toLocaleDateString()}</p>
                    <p className="text-sm text-textLight mt-1">{order.items.length} items</p>
                  </div>
                  <div className="flex flex-col sm:items-end">
                    <p className="font-medium text-textMain">{formatPrice(order.total)}</p>
                    <span className="inline-block mt-1 px-2.5 py-1 bg-black/5 rounded text-[11px] uppercase tracking-wider font-semibold text-textMain">
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
