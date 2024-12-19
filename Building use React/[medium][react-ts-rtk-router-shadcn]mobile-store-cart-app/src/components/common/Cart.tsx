import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Button } from '../ui/button';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { cartSlice } from '@features/cart/cartSlice';
import { Card } from '../ui/card';
import formatPrice from '@helpers/formatPrice';
import { AppDispatch, Mobile } from '@helpers/types';
import { useState } from 'react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/alert-dialog';

export const Cart = () => {
  const dispatch = useDispatch<AppDispatch>();
  const cartAmount = useSelector(cartSlice.selectors.cartAmount);
  const cartItems = useSelector(cartSlice.selectors.cartItems);
  const cartTotal = useSelector(cartSlice.selectors.cartTotal);
  const [toggleAlert, setToggleAlert] = useState(false);

  const handleClearCart = () => dispatch(cartSlice.actions.clearCartItems());

  const handleUpdateAmount = (id: string, change: number) =>
    dispatch(cartSlice.actions.updateCartItemAmount({ id, change }));

  const handleRemoveClick = (id: string) => dispatch(cartSlice.actions.removeCartItem(id));

  const renderCartItem = (device: Mobile) => (
    <li key={device.id}>
      <Card className="p-2 flex flex-col gap-2.5 h-full">
        <img className="max-w-[50px] mx-auto" src={device.img} alt={device.title} />
        <h3 className="font-semibold uppercase text-center">
          {device.title} ({formatPrice(parseFloat(device.price))})
        </h3>
        <div className="grid gap-2.5 mt-auto">
          <div className="grid grid-cols-3 gap-2.5">
            <Button onClick={() => handleUpdateAmount(device.id, 1)}>
              <Plus size={16} />
            </Button>
            <Button variant="link">{device.amount}</Button>
            <Button
              onClick={() => handleUpdateAmount(device.id, -1)}
              disabled={device.amount <= 1}
            >
              <Minus size={16} />
            </Button>
          </div>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete device from cart.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleRemoveClick(device.id)}>Continue</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </Card>
    </li>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <ShoppingBag />
          <span>{cartAmount}</span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader className='grid gap-1 mb-2'>
          <SheetTitle>Edit cart items</SheetTitle>
          <SheetDescription>Make changes to your cart.</SheetDescription>
        </SheetHeader>

        <ul className="grid gap-2">{cartItems?.map(renderCartItem)}</ul>

        <div className="grid gap-2 mt-3">
          <p className="text-center">Total: <span
            className="font-semibold">{formatPrice(parseFloat(cartTotal.toFixed(2)))}</span>
          </p>
          <Button onClick={handleClearCart}>Clear cart</Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

Cart.displayName = 'Cart';
