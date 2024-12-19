import React from 'react';
import { Card } from '@/components/ui/card.tsx';
import { useGetPhonesQuery } from '../features/mobiles/mobilesApi';
import { Spinner } from '../components/ui';
import { useDispatch, useSelector } from 'react-redux';
import { cartSlice } from '../features/cart/cartSlice';
import { Button } from '../components/ui/button';
import { AppDispatch, Mobile, RootState } from '../helpers/types';
import { Minus, Plus } from 'lucide-react';
import formatPrice from '../helpers/formatPrice';

const HomePage = () => {
  const { data, isError, isLoading } = useGetPhonesQuery('');
  const dispatch = useDispatch<AppDispatch>();
  const items = useSelector((state: RootState) => cartSlice.selectors.items(state));
  const cartItems = useSelector((state: RootState) => cartSlice.selectors.cartItems(state));

  const handleUpdateCart = (device: Mobile, change: number) => {
    dispatch(cartSlice.actions.updateCartItemAmount({ id: device.id, change }));
  };

  const getItemAmount = (id: string): number => {
    const item = cartItems.find(item => item.id === id);
    return item ? item.amount : 0;
  };

  const renderDeviceCard = (device: Mobile) => {
    const amount = getItemAmount(device.id);
    return (
      <li key={device.id}>
        <Card className="p-2 flex flex-col gap-2.5 h-full">
          <img className="max-w-[200px] mx-auto" src={device.img} alt={device.title} />
          <h3 className="font-semibold uppercase text-center">
            {device.title} ({formatPrice(parseFloat(device.price))})
          </h3>
          <div className="grid gap-2.5 mt-auto">
            {amount === 0 ? (
              <Button onClick={() => handleUpdateCart(device, 1)}>
                Add to Cart
              </Button>
            ) : (
              <div className="flex justify-between items-center">
                <Button onClick={() => handleUpdateCart(device, -1)}>
                  <Minus size={16} />
                </Button>
                <span>{amount}</span>
                <Button onClick={() => handleUpdateCart(device, 1)}>
                  <Plus size={16} />
                </Button>
              </div>
            )}
          </div>
        </Card>
      </li>
    );
  };

  if (isLoading) return <Spinner />;
  if (isError) return <p className="text-center text-red-500">Error when loading data.</p>;

  return (
    <Card className="p-4">
      <ul className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
        {items?.map(renderDeviceCard)}
      </ul>
    </Card>
  );
};

export default HomePage;
