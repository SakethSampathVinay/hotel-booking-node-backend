import { pool } from "../database/db.js";
import cloudinary from "../config/cloudinary.js";

const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "hotels" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

const addHotel = async (req, res) => {
  const db = await pool.getConnection();

  try {
    const { hotel_name, street_address, room_type, price_per_night } = req.body;

    if (!hotel_name || !street_address || !room_type || !price_per_night) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided",
      });
    }

    let amenities = [];
    if (req.body.amenities) {
      amenities = Array.isArray(req.body.amenities)
        ? req.body.amenities
        : [req.body.amenities];
    }

    let imageUrls = [];
    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        const result = await streamUpload(file.buffer);
        imageUrls.push(result.secure_url);
      }
    }

    const roomResult = await db.query(
      `INSERT INTO rooms (hotel_name, street_address, room_type, price_per_night, amenities, images) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        hotel_name,
        street_address,
        room_type,
        price_per_night,
        JSON.stringify(amenities),
        JSON.stringify(imageUrls),
      ]
    );

    return res.status(200).json({
      success: true,
      message: "Hotel Added Successfully",
      roomId: roomResult.insertId.toString(),
      images: imageUrls,
    });
  } catch (error) {
    console.error("Error adding hotel: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Error Adding Hotel" });
  } finally {
    db.release();
  }
};

const getHotels = async (req, res) => {
  const db = await pool.getConnection();

  try {
    const hotels = await db.query(`SELECT * FROM rooms`);
    return res.status(200).json({
      success: true,
      message: "Fetched all Hotels",
      hotels,
    });
  } catch (error) {
    console.error("Error Fetching Hotels: ", error);
    return res
      .status(400)
      .json({ success: false, message: "Error Fetching the Hotels" });
  } finally {
    db.release();
  }
};

export { addHotel, getHotels };
