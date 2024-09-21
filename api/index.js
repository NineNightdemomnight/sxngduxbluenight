import bypassFluxus from './bypassFluxus';

export default async function handler(req, res) {
  if (req.method === 'GET' && req.query.startUrl) {
    return bypassFluxus(req, res);
  }

  res.status(404).json({ message: "Not Found" });
}
