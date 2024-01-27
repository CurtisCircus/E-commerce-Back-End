const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  try {
    // find all tags and include associated Product data
    const tags = await Tag.findAll({
      include: [{ model: Product, through: ProductTag }],
    });
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    // find a single tag by its `id` and include associated Product data
    const tag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag }],
    });

    // If tag is not found, send a 404 response
    if (!tag) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json(tag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    // create a new tag
    const newTag = await Tag.create(req.body);
    res.status(201).json(newTag);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create tag', details: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    // update a tag's name by its `id` value
    const [affectedRows] = await Tag.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    // If no rows were updated, tag with the given id was not found
    if (affectedRows === 0) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    const updatedTag = await Tag.findByPk(req.params.id);
    res.json(updatedTag);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to update tag', details: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    // delete one tag by its `id` value
    const deletedTag = await Tag.destroy({
      where: { id: req.params.id },
    });

    // If no rows were deleted, tag with the given id was not found
    if (deletedTag === 0) {
      res.status(404).json({ error: 'Tag not found' });
      return;
    }

    res.json({ message: 'Tag deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;