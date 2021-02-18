import React, {useEffect, useState, useMemo} from 'react';
import { getSku } from './get-sku';

function ProductBlock({prod, updateQty}) {
  const [prodSku, setProdSku] = useState(prod.sku);
  const [dataOptions, setDataOptions] = useState(prod.options);
  const [stock, setStock] = useState({});
  const [addingStatus, setAddingStatus] = useState(false);
  const [addedStatus, setAddedStatus] = useState(false);
  
  const options = useMemo(() => {
    return dataOptions.map((option) => {
      const values = option.values.map((value) => {
        const lookupKey = `${option.id}_${value.id}`;
        return {
          ...value,
          in_stock: stock[lookupKey],
        };
      });
      return {
        ...option,
        values,
      }
    });
  }, [dataOptions, stock]);

  useEffect(() => {
    async function getStockEffect() {
      const productAttributes = await getSku(prod.id, dataOptions);
   
      if (productAttributes) {
        let newStocks = {};
        prod.options.forEach((option) => {
          option.values.forEach((value) => {
            let isInStock = true;
            if (productAttributes.in_stock_attributes !== undefined && productAttributes.in_stock_attributes.indexOf(value.id) < 0) {
              isInStock = false;
            }
            newStocks[`${option.id}_${value.id}`] = isInStock;
          });
        });
        setStock(newStocks);

        setProdSku(productAttributes.sku);
      }
    }
    getStockEffect();
  }, [prod, dataOptions]);

  async function addCart(key, sku, qty) {
    setAddedStatus(false);
    
    if (sku) {
      setAddingStatus(true);
  
      const res = await fetch(`/cart.php?action=add&sku=${sku}&qty=${qty}`);
      const added = res.url.includes('cart.php');
  
      setAddedStatus(added);

      if (added) {
        setAddingStatus(false);
      }
    }
  }

  return (
    <li className="collection-item" key={prod.key}>
      <div className="collection-img">
        <a href={prod.url}><img src={prod.image} alt={prod.imagealt}/></a>
      </div>
      <div className="collection-details">
        <p><a href={prod.url}><strong>{prod.name}</strong></a></p>
        <p>{(Math.round(prod.price * 100) / 100).toFixed(2)}</p>
        {options.map((option, i) => {
          // (evt) => updateBlock(prod.key, prod.id, option.label, evt.target.value)}
          const updateSelected = (evt) => {
            // updateAvailable(key, productId, newProductGrid);
            
            let newOptionList = options.map((loopedOption) => {
              if (loopedOption.label === option.label) {
                const newOption = {
                  ...loopedOption,
                  selected: evt.target.value
                };
                return newOption;
              } else {
                return loopedOption;
              }
            });
            setDataOptions(newOptionList);
          };

          return (
            <div key={i}>
              <label>{option.label}</label>
              <select value={option.selected} onChange={updateSelected}>
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
        <div className="collection-item--action">
          <input type="number" value={prod.qty} onChange={(evt) => updateQty(prod.id, evt.target.value)}/>
          <button className="button" onClick={(evt) => addCart(prod.key, prodSku, prod.qty)} disabled={addingStatus}>{addingStatus ? 'Adding To Cart' : 'Add To Cart'}</button>
          {addedStatus ?
              <span className="checkmark">
                <div className="checkmark_circle"></div>
                <div className="checkmark_stem"></div>
                <div className="checkmark_kick"></div>
              </span>
          : ''}
        </div>
      </div>
    </li>
  )
}

export default ProductBlock;
