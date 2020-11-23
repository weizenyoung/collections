export async function getProducts(token, productIds) {
  const res = await fetch('/graphql', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      query: `
        query SingleProduct {
          site {
            products(entityIds: [${productIds}], first: 50) {
              edges {
                node {
                  name
                  entityId
                  path
                  addToCartUrl
                  defaultImage {
                      url (width: 200)
                  }
                  inventory {
                    aggregated {
                      availableToSell
                    }
                  }
                  description
                  warranty
                  customFields {
                    edges {
                      node {
                        name
                        value
                      }
                    }
                  }
                  options (first: 50){
                    edges{
                        node{
                            displayName
                            entityId
                            values (first: 50){
                                edges{
                                    node{
                                        label
                                        entityId
                                    }
                                }
                            }
                        }
                    }
                  }
                  variants {
                    edges {
                      node {
                        sku
                        prices {
                          price {
                            value
                          }
                        }
                        productOptions {
                          edges {
                            node {
                              displayName
                              __typename
                              ... OptionFields
                            }
                          }
                        }
                      }
                    }
                  }
                  prices {
                    price {
                      value
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }

        fragment OptionFields on MultipleChoiceOption {
          values {
            edges {
              node {
                label
                ... SwatchOptions
              }
            }
          }
        }
      
        fragment SwatchOptions on SwatchOptionValue {
          hexColors
          imageUrl (width: 200)
        }
      `
    }),
  });

  const data = await res.json();
  return formatData(data);
}

function formatData(data) {
  const productData = data.data.site.products.edges;
  let count = 0;
  const prodList = productData.map((prod) => {
    const currentProd = prod.node;
    count ++;

    const options = prod.node.options.edges.map((option) => {
      const optionValues = option.node.values.edges.map((value) => {
        return {
          label: value.node.label,
          id: value.node.entityId,
          in_stock: true,
        }
      });
      return {
        label: option.node.displayName,
        id: option.node.entityId,
        selected: "",
        values: optionValues,
      }
    });

    return {
      key: count,
      name: currentProd.name,
      id: currentProd.entityId,
      url: currentProd.path,
      addcart: currentProd.addToCartUrl,
      image: currentProd.defaultImage.url,
      price: currentProd.prices.price.value,
      options: options,
      qty: 1,
      adding: false,
    }
  });
  
  return prodList;
}
