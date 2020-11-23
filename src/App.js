import React, { useEffect, useState } from 'react';
import { getProducts } from './get-products';
import ProductGrid from './ProductGrid';
import { getSku } from './get-sku';

// const initialData = process.env.NODE_ENV === 'production' ? window.initialData : {
//   token: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJlYXQiOjE2MDYyNzI2MTUsInN1Yl90eXBlIjowLCJ0b2tlbl90eXBlIjoxLCJjb3JzIjpbImh0dHBzOi8vYmxpbmctdGVtcGxhdGUuc3Byb3V0Y29tbWVyY2UuY29tIl0sImNpZCI6MSwiaWF0IjoxNjA2MDk5ODE1LCJzdWIiOiJiY2FwcC5saW5rZXJkIiwic2lkIjo2MTQzMzIsImlzcyI6IkJDIn0.UxUK3B9I--xKZlVLAUTHTDf-lGnq0NWZAw8Ufp47luZjaIY6S1DjM4FTeBg081Zf_odco_FDN7WNEEtHpacJRg',
//   productIds: [304, 303, 302, 301, 300, 299, 298, 297, 296, 295, 294, 293, 292, 291, 290, 289, 288, 287, 286, 285, 282, 281, 280, 279, 278, 277, 276, 275, 274, 273],
// };

// if (process.env.NODE_ENV === 'development') {
//   window.BCData = {"csrf_token":"40f130665772a7fff56da4161145418cf53c40e15558abe094a67570ebeea08f"};
// };

// const token = window.initialData.token;
// const productIds = window.initialData.productIds;

function App({token, productIds}) {
  const [productGrid, setProductGrid] = useState(null);

  useEffect(() => {
    getProducts(token, productIds)
      .then((data) =>{
        setProductGrid(data);
      });
  }, []);

  async function updateOption(key, label, value) {
    const newProductGrid = productGrid.map((product) => {
      if (product.key === key) {
        // update the selected option
        let newOptionList = product.options.map((option) => {
          if (option.label === label) {
            const newOption = {
              ...option,
              selected: value
            };
            return newOption;
          }
          return option;
        });
        return {
          ...product,
          options: newOptionList,
        };
      }
      return product;
    });

    setProductGrid(newProductGrid);
    return newProductGrid;
  }

  async function updateAvailable(key, productId, oldProductGrid) {
    const newProductGrid = await asyncMap(oldProductGrid, async(productBlock) => {
      const productAttributes = productBlock.key === key ? await getSku(productId, productBlock.options) : null;
      
      if (productAttributes) {
        const newOption = productBlock.options.map((option) => {
          const newAttributeList = option.values.map((value) => {
            let isInStock = true;
            if (productAttributes.in_stock_attributes !== undefined && productAttributes.in_stock_attributes.indexOf(value.id) < 0) {
              isInStock = false;
            }
            const newAttribute = {
              ...value,
              in_stock: isInStock,
            };
            return newAttribute;
          });
          return {
            ...option,
            values: newAttributeList,
          };
        });
        return {
          ...productBlock,
          options: newOption,
          sku: productAttributes.sku,
          stock: productAttributes.stock,
          price: productAttributes.price,
        };
      } else {
        return {
          ...productBlock,
        };
      }
    });
    setProductGrid(newProductGrid);
  }

  async function updateBlock(key, productId, label, value) {
    const newProductGrid = await updateOption(key, label, value);
    updateAvailable(key, productId, newProductGrid);
  }

  async function addCart(key, sku, qty) {
    if (sku) {
      const newProductGrid = await asyncMap(productGrid, async(productBlock) => {
        if (productBlock.key === key) {
          return {
            ...productBlock,
            adding: true,
          }
        } else {
          return {
            ...productBlock,
          }
        }
      });
      setProductGrid(newProductGrid);

      const res = await fetch(`/cart.php?action=add&sku=${sku}&qty=${qty}`);
      const added = res.url.includes('cart.php');

      setProductGrid((productGrid) => {
        return productGrid.map((line) => {
          if (line.sku === sku) {
            return {
              ...line,
              addedToCart: added,
              adding: false,
            };
          } 
          return {...line};
        });
      });
    }
  }

  function updateQty(id, qty) {
    const newProductGrid = productGrid.map((productBlock, i) => {
      if (productBlock.id === id) {
        return {
          ...productBlock,
          qty,
        };
      }
      return productBlock;
    });

    setProductGrid(newProductGrid);
  }

  return (
    <div className="App">
      <ProductGrid data={productGrid} updateBlock={updateBlock} updateQty={updateQty} addCart={addCart} />
    </div>
  );
}

async function asyncMap(arr, fn) {
  const newArr = [];
  for (let i=0; i<arr.length; i++) {
    newArr.push(await fn(arr[i]));
  }
  return newArr;
}

export default App;
