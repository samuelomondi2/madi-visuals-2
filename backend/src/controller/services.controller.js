const servicesService = require("../services/services.service");

exports.getServices = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const services = await servicesService.getAllServices();

    if (!services || services.length === 0) {
      return res.status(404).json({ message: "No services found" });
    }

    res.json({ services });
  } catch (error) {
    console.error("GET services error:", error.stack || error);
    res.status(500).json({ message: error.message });
  }
};

exports.getService = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const { id } = req.params;
    const service = await servicesService.getASingleService({ id });

    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }

    res.json({ service });
  } catch (error) {
    console.error("GET service error:", error.stack || error);
    res.status(500).json({ message: error.message });
  }
};