const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  try {
    // find all products and include associated Category and Tag data
    const products = await Product.findAll({
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// get one product
router.get('/:id', async (req, res) => {
  try {
    // find a single product by its `id` and include associated Category and Tag data
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag, through: ProductTag }],
    });

    // If product is not found, send a 404 response
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// create new product
router.post('/', async (req, res) => {
  try {
    const product = await Product.create(req.body);

    if (req.body.tagIds && req.body.tagIds.length) {
      const productTagIdArr = req.body.tagIds.map((tag_id) => {
        return {
          product_id: product.id,
          tag_id,
        };
      });
      await ProductTag.bulkCreate(productTagIdArr);
    }

    const productWithTags = await Product.findByPk(product.id, {
      include: [{ model: Tag, through: ProductTag }],
    });

    res.status(201).json(productWithTags);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create product', details: err.message });
  }
});

// update product
router.put('/:id', async (req, res) => {
  try {
    const [affectedRows] = await Product.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (affectedRows === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    if (req.body.tagIds && req.body.tagIds.length) {
      const existingProductTags = await ProductTag.findAll({
        where: { product_id: req.params.id },
      });

      const productTagIds = existingProductTags.map(({ tag_id }) => tag_id);
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

      const productTagsToRemove = existingProductTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    const updatedProductWithTags = await Product.findByPk(req.params.id, {
      include: [{ model: Tag, through: ProductTag }],
    });

    res.json(updatedProductWithTags);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update product', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // delete one product by its `id` value
    const deletedProduct = await Product.destroy({
      where: { id: req.params.id },
    });

    // If no rows were deleted, product with the given id was not found
    if (deletedProduct === 0) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = productRoutes;