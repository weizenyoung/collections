import React, {useEffect} from 'react';
import ProductBlock from './ProductBlock';

function ProductGrid({data, updateQty, addCart}) {
  return (
    <ul className="collection-grid">
      {data ? data.map((prod) => {
        return <ProductBlock key={prod.id} prod={prod} updateQty={updateQty} addCart={addCart} />
      }) : null}
    </ul>
  )
}
  
export default ProductGrid;