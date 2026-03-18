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

exports.addService = async (req, res) => {
  try {
    const { name, duration, base_price, delivery, category } = req.body;

    const result = await servicesService.addAService({
      name,
      duration,
      base_price,
      delivery,
      category,
    });

    const service = await servicesService.getASingleService({
      id: result.insertId,
    });

    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const { id } = req.params;

    const updates = req.body;

    const result = await servicesService.updateAService(id, updates);

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({
        message: "Service not found"
      });
    }

    res.json({
      success: true,
      message: "Service updated successfully"
    });

  } catch (err) {
    console.error("Service updating error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");

    const { id } = req.params;
    await servicesService.deleteAService({ id }); 

    res.status(200).json({
      success: true,
      message: "Service deleted successfully",
    });
  } catch (error) {
    console.error("Service deletion error:", error);
    res.status(500).json({ message: error.message });
  }
};