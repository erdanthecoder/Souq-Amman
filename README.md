# Souq Amman — Marketplace

A static marketplace website for sellers in Amman, Jordan, hosted on GitHub Pages.

- `index.html`: the public store. It opens with an animated intro, then shows a hero section and the product grid with search, sorting and a details popup.
- `sell.html`: the password-protected **Seller Studio**, where sellers add a product (picture, name, description, price in JOD, optional address) or delete one.
- `assets/`: styles and scripts.

Products are stored in Supabase (table `amman_products`). Visitors can only read them.
Adding and deleting go through database functions that check the seller password on the server.

## Publish on GitHub Pages
Settings → Pages → Source: *Deploy from a branch* → choose the branch and `/ (root)` → Save.
