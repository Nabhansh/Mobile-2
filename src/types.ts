export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
  image: string;
  seller_name: string;
}

export interface CartItem extends Product {}
