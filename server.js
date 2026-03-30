const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuration de la DB (remplace par tes identifiants)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Si l'URL ne contient pas "localhost", on active le SSL pour la base distante
  ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
});

// --- ROUTES ---

// 1. Récupérer tous les produits
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Product ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Ajouter un produit
app.post('/products', async (req, res) => {
  const { numProduit, designation, prix, quantite } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Product (numProduit, designation, prix, quantite) VALUES ($1, $2, $3, $4) RETURNING *',
      [numProduit, designation, prix, quantite]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Modifier un produit
app.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const { numProduit, designation, prix, quantite } = req.body;
  try {
    const result = await pool.query(
      'UPDATE Product SET numProduit = $1, designation = $2, prix = $3, quantite = $4 WHERE id = $5 RETURNING *',
      [numProduit, designation, prix, quantite, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Supprimer un produit
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM Product WHERE id = $1', [id]);
    res.json({ message: 'Produit supprimé' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Serveur backend lancé sur http://localhost:${port}`);
});