from flask import Flask, render_template, request
import joblib
import pandas as pd
import os

# Force CPU mode
os.environ["XGBOOST_ENABLE_GPU"] = "0"
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

app = Flask(__name__)
model = joblib.load("xgboost_model.joblib")

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    try:
        vendor_id = int(request.form["vendor_id"])
        passenger_count = int(request.form["passenger_count"])
        trip_distance = float(request.form["trip_distance"])
        ratecode_id = int(request.form["ratecode_id"])
        pu_location_id = int(request.form["pu_location_id"])
        do_location_id = int(request.form["do_location_id"])
        payment_type = int(request.form["payment_type"])
        fare_amount = float(request.form["fare_amount"])
        extra = float(request.form["extra"])
        mta_tax = float(request.form["mta_tax"])
        tolls_amount = float(request.form["tolls_amount"])
        improvement_surcharge = float(request.form["improvement_surcharge"])
        congestion_surcharge = float(request.form["congestion_surcharge"])
        airport_fee = float(request.form["airport_fee"])

        # Auto compute total
        total_amount = round(fare_amount + extra + mta_tax + tolls_amount +
                             improvement_surcharge + congestion_surcharge + airport_fee, 2)

        # Match model features
        features = pd.DataFrame([[
            vendor_id, passenger_count, trip_distance, ratecode_id,
            pu_location_id, do_location_id, payment_type, fare_amount,
            extra, mta_tax, tolls_amount, improvement_surcharge,
            total_amount, congestion_surcharge, airport_fee
        ]], columns=[
            "VendorID", "passenger_count", "trip_distance", "RatecodeID",
            "PULocationID", "DOLocationID", "payment_type", "fare_amount",
            "extra", "mta_tax", "tolls_amount", "improvement_surcharge",
            "total_amount", "congestion_surcharge", "airport_fee"
        ])

        # Prediction
        tip_pred = float(model.predict(features)[0])
        tip_pred = round(tip_pred, 2)
        tip_percent = round((tip_pred / fare_amount) * 100, 2)
        total_with_tip = round(total_amount + tip_pred, 2)

        return render_template(
            "result.html",
            error=False,
            tip=tip_pred,
            distance=trip_distance,
            fare=fare_amount,
            passengers=passenger_count,
            percent=tip_percent,
            total=total_with_tip,
            computed_total=total_amount
        )

    except Exception as e:
        return render_template("result.html", error=True, message=str(e))

if __name__ == "__main__":
    app.run(debug=True)
