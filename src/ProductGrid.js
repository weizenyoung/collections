import React from 'react';

function ProductGrid({data, updateBlock, updateQty, addCart}) {
  console.log('product grid: ', data);
  // let products = data.site.products.edges;
  return (
    <ul className="collection-grid">
      {data ? data.map((prod) => {
        return (
          <li key={prod.key}>
            <div className="collection-img">
              <a href={prod.url}><img src={prod.image} /></a>
            </div>
            <div className="collection-details">
              <p><a href={prod.url}><strong>{prod.name}</strong></a></p>
              <p>{(Math.round(prod.price * 100) / 100).toFixed(2)}</p>
              {prod.options.map((option, i) => {
                return (
                  <div key={i}>
                    <label>{option.label}</label>
                    <select value={option.selected} onChange={(evt) => updateBlock(prod.key, prod.id, option.label, evt.target.value)}>
                    <option key={i} value="">-- Choose {option.label} --</option>
                      {option.values.map((value, i) => {
                        return (
                          <option key={i} value={value.id} disabled={!value.in_stock}>
                            {value.label} {value.in_stock ? '' : '(Out of stock)'}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                );
              })}
              <input type="number" value={prod.qty} onChange={(evt) => updateQty(prod.id, evt.target.value)}/>
              <button className="button" onClick={(evt) => addCart(prod.key, prod.sku, prod.qty)} disabled={prod.adding}>{prod.adding ? 'Adding To Cart' : 'Add To Cart'}</button>
              {prod.addedToCart ?
                  <span className="checkmark">
                    <div className="checkmark_circle"></div>
                    <div className="checkmark_stem"></div>
                    <div className="checkmark_kick"></div>
                  </span>
              : ''}
            </div>
          </li>
        )
      }) : null}
    </ul>
  )
}
  
export default ProductGrid;