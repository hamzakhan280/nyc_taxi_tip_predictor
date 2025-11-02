from flask import Flask, render_template, request
import joblib
import pandas as pd
import os

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
        trip_distance = float(request.form["trip_distance"])
        fare_amount = float(request.form["fare_amount"])
        passenger_count = int(request.form["passenger_count"])
        tolls_amount = float(request.form["tolls_amount"])
        congestion_surcharge = float(request.form["congestion_surcharge"])
        airport_fee = float(request.form["airport_fee"])
        ratecode_id = int(request.form["ratecode_id"])

        # Automatically calculate total_amount
        total_amount = fare_amount + tolls_amount + congestion_surcharge + airport_fee

        # Build feature DataFrame (matching model’s training columns)
        features = pd.DataFrame([[
            1,  # VendorID default
            passenger_count,
            trip_distance,
            ratecode_id,
            132,  # PULocationID placeholder
            265,  # DOLocationID placeholder
            1,    # payment_type (cash)
            fare_amount,
            0.5,  # extra
            0.5,  # mta_tax
            tolls_amount,
            0.3,  # improvement_surcharge
            total_amount,
            congestion_surcharge,
            airport_fee
        ]], columns=[
            'VendorID','passenger_count','trip_distance','RatecodeID','PULocationID',
            'DOLocationID','payment_type','fare_amount','extra','mta_tax','tolls_amount',
            'improvement_surcharge','total_amount','congestion_surcharge','airport_fee'
        ])

        tip_pred = float(model.predict(features)[0])
        tip_pred = round(tip_pred, 2)
        tip_percent = round((tip_pred / fare_amount) * 100, 2)
        total_with_tip = round(fare_amount + tip_pred, 2)

        return render_template(
            "result.html",
            tip=tip_pred,
            distance=trip_distance,
            fare=fare_amount,
            passengers=passenger_count,
            percent=tip_percent,
            total=total_with_tip
        )

    except Exception as e:
        return render_template("result.html", tip=f"Error: {e}")

if __name__ == "__main__":
    app.run(debug=True)
