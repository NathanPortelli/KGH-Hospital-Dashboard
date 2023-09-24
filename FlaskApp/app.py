from flask import Flask, render_template, request

import pandas as pd
import numpy as np

from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_absolute_error, mean_squared_error, confusion_matrix
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, GridSearchCV

import matplotlib.pyplot as plt
import plotly.graph_objects as go
import io
import base64

app = Flask(__name__)


@app.route('/')
def home():
    return render_template('index.html')


# Logistic Regression
def preprocess_data():
    # Dataset containing admission & discharge scores, age, sex and LOS of previous admissions
    data = pd.read_csv('data/barthelflaskCOMBINED.csv')

    # Column ranges in barthelflaskCOMBINED file dividing admission details discharge details
    admission_feature_range = range(0, 13)  # Columns containing admission features
    discharge_feature_range = range(13, 25)  # Columns containing discharge features

    # Relevant features for predicting
    admission_features = data.iloc[:, admission_feature_range].values  # Barthel Index Admission Details, Age & Sex
    discharge_features = data.iloc[:, discharge_feature_range].values  # Barthel Index Discharge Details & LOS
    # Determining the Total Discharge score
    target_discharge = data['Total Barthel Discharge'].values
    print("target_discharge", target_discharge)
    # Determining the total Length of Stay in number of days
    target_days = data['LOS'].values
    print("LOS", target_days)

    # Test - Converting age to numeric
    admission_features['Age'] = pd.to_numeric(admission_features['Age'], errors='coerce')

    # Splitting dataset into training and testing sets
    train_data, test_data, train_labels_discharge, test_labels_discharge, train_labels_days, test_labels_days = train_test_split(
        admission_features, target_discharge, target_days, test_size=0.2, random_state=42
    )

    # Logistic Regression algorithm
    # Scaling the data for logistic regression
    scaler_lr = StandardScaler()
    train_data_lr = scaler_lr.fit_transform(train_data)
    test_data_lr = scaler_lr.transform(test_data)

    # Training model for predicting discharge Barthel Index scores
    logreg = LogisticRegression(max_iter=1000)
    logreg.fit(train_data_lr, train_labels_discharge)

    # Random Forest algorithm
    # Scaling the data for random forest
    scaler_rf = StandardScaler()
    train_data_rf = scaler_rf.fit_transform(train_data)
    test_data_rf = scaler_rf.transform(test_data)

    # Defining the parameter grid for random forest
    # Values already hypertuned for best estimator so as to not lengthen processing time
    param_grid = {
        'n_estimators': [200],
        'max_depth': [5],
        'min_samples_leaf': [4]
    }

    # Performing a grid search and returning the best estimator
    grid_search = GridSearchCV(RandomForestRegressor(), param_grid, cv=5)
    grid_search.fit(train_data_rf, train_labels_days)
    rf = grid_search.best_estimator_

    return scaler_lr, scaler_rf, logreg, rf, test_data_lr, test_labels_discharge, test_data_rf, test_labels_days


@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        input_values = []
        for i in range(1, 14):
            input_value = int(request.form['input' + str(i)])
            input_values.append(input_value)

        scaler, scaler_lr, scaler_rf, logreg, rf, test_data_lr, test_labels_discharge, test_data_rf, test_labels_days = preprocess_data()

        # Scaling the input values
        scaled_input = scaler.transform([input_values])  # Test
        random_admission_barthel = [input_values]
        random_admission_barthel_lr = scaler_lr.transform(random_admission_barthel)
        random_admission_barthel_rf = scaler_rf.transform(random_admission_barthel)

        # Creating the prediction
        los_prediction = rf.predict(scaled_input)[0]  # Test
        length_of_stay_prediction = rf.predict(random_admission_barthel_rf)

        # Calculating accuracy and error
        discharge_accuracy = logreg.score(test_data_lr, test_labels_discharge)
        days_error = rf.score(test_data_rf, test_labels_days)

        # Generating a histograms comparing actual and predicted
        plt.figure(figsize=(10, 6))
        plt.hist(test_labels_discharge, bins='auto', alpha=0.7, color='blue', label='Actual')
        plt.hist(logreg.predict(test_data_lr), bins='auto', alpha=0.7, color='green', label='Predicted')
        plt.xlabel('Discharge Barthel Index')
        plt.ylabel('Frequency')
        plt.title('Histogram of Actual and Predicted Discharge Barthel Index')
        plt.legend()
        plt.savefig('static/histogram.png')

        # Confusion Matrix - Predicted & True
        cm = confusion_matrix(test_labels_discharge, logreg.predict(test_data_lr))
        plt.figure(figsize=(10, 6))
        plt.imshow(cm, interpolation='nearest', cmap='coolwarm')
        plt.title('Confusion Matrix')
        plt.colorbar()
        plt.xticks([0, 1], ['Predicted 0', 'Predicted 1'])
        plt.yticks([0, 1], ['Actual 0', 'Actual 1'])
        plt.xlabel('Predicted Label')
        plt.ylabel('True Label')
        plt.savefig('static/confusion_matrix.png')

        return render_template('result.html',
                               prediction=length_of_stay_prediction[0],
                               accuracy=discharge_accuracy,
                               error=days_error,)

    return render_template('index.html')


# Random Forest
@app.route('/predict', methods=['POST'])
def predict():
    # For displaying the user's inputted values prior to results
    # Scores 1 - 11 contain admission details, scores 12-22 contain target discharge details
    user_inputs = {
        'score1': request.form.get('score1'),
        'score2': request.form.get('score2'),
        'score3': request.form.get('score3'),
        'score4': request.form.get('score4'),
        'score5': request.form.get('score5'),
        'score6': request.form.get('score6'),
        'score7': request.form.get('score7'),
        'score8': request.form.get('score8'),
        'score9': request.form.get('score9'),
        'score10': request.form.get('score10'),
        'score11': request.form.get('score11'),
        'score12': request.form.get('score12'),
        'score13': request.form.get('score13'),
        'score14': request.form.get('score14'),
        'score15': request.form.get('score15'),
        'score16': request.form.get('score16'),
        'score17': request.form.get('score17'),
        'score18': request.form.get('score18'),
        'score19': request.form.get('score19'),
        'score20': request.form.get('score20'),
        'score21': request.form.get('score21'),
        'score22': request.form.get('score22'),
        'age': request.form.get('age'),
        'sex': request.form.get('sex'),
    }
    score1 = int(request.form.get('score1', 0))
    score2 = int(request.form.get('score2', 0))
    score3 = int(request.form.get('score3', 0))
    score4 = int(request.form.get('score4', 0))
    score5 = int(request.form.get('score5', 0))
    score6 = int(request.form.get('score6', 0))
    score7 = int(request.form.get('score7', 0))
    score8 = int(request.form.get('score8', 0))
    score9 = int(request.form.get('score9', 0))
    score10 = int(request.form.get('score10', 0))
    score11 = int(request.form.get('score11', 0))
    score12 = int(request.form.get('score12', 0))
    score13 = int(request.form.get('score13', 0))
    score14 = int(request.form.get('score14', 0))
    score15 = int(request.form.get('score15', 0))
    score16 = int(request.form.get('score16', 0))
    score17 = int(request.form.get('score17', 0))
    score18 = int(request.form.get('score18', 0))
    score19 = int(request.form.get('score19', 0))
    score20 = int(request.form.get('score20', 0))
    score21 = int(request.form.get('score21', 0))
    score22 = int(request.form.get('score22', 0))
    sex = int(request.form.get('sex', 0))
    age = int(request.form.get('age', 0))

    # Load dataset into DataFrame
    df = pd.read_csv('data/barthelflaskCOMBINED.csv')
    df.columns = df.columns.str.strip()  # Test

    # Separate features from target variables
    X = df.drop(['Total Barthel Discharge', 'LOS'], axis=1).to_numpy()
    y_bi = df['Total Barthel Discharge']
    y_days = df['LOS']

    X = pd.DataFrame(X)  # Converting to DataFrame
    X = X.dropna()  # Dropping missing values, if any
    y_bi = y_bi[X.index]
    y_days = y_days[X.index]

    # Standardising the features
    scaler = StandardScaler()
    X = scaler.fit_transform(X)

    # Splitting dataset into training and testing sets
    X_train, X_test, y_bi_train, y_bi_test, y_days_train, y_days_test = train_test_split(X, y_bi, y_days, test_size=0.2,
                                                                                         random_state=42)

    # Fitting the discharge Barthel Index model
    rf_bi = RandomForestRegressor(random_state=42, n_estimators=100, max_depth=5)
    rf_bi.fit(X_train, y_bi_train)

    # Fitting the total LOS model
    rf_days = RandomForestRegressor(random_state=42, n_estimators=100, max_depth=5)
    rf_days.fit(X_train, y_days_train)

    # User's input values
    admission_scores = [score1, score2, score3, score4, score5, score6, score7, score8, score9, score10,
                        score11, score12, score13, score14, score15, score16, score17, score18, score19,
                        score20, score21, age, sex]

    # DataFrame containing input values
    new_data = pd.DataFrame([admission_scores], columns=df.drop(['Total Barthel Discharge', 'LOS'], axis=1).columns)

    # Standardising the new data using the same scaler
    new_data = scaler.transform(new_data)

    # Creating predictions on input values
    bi_pred = rf_bi.predict(new_data)[0]
    days_pred = rf_days.predict(new_data)[0]
    # Rounding predictions
    bi_pred_round = int(round(bi_pred))
    days_pred_round = int(round(days_pred))

    # Creating predictions on the test data
    bi_pred_test = rf_bi.predict(X_test)
    days_pred_test = rf_days.predict(X_test)

    # Calculating the Mean Absolute Error
    mae_bi = mean_absolute_error(y_bi_test, bi_pred_test)
    mae_days = mean_absolute_error(y_days_test, days_pred_test)

    # Calculating the Mean Squared Error
    mse_bi = mean_squared_error(y_bi_test, bi_pred_test)
    mse_days = mean_squared_error(y_days_test, days_pred_test)

    # Calculating the Root Mean Squared Error
    rmse_bi = np.sqrt(mse_bi)
    rmse_days = np.sqrt(mse_days)

    # Rounding the statistics to 2dp (for easier reading)
    mae_bi = round(mae_bi, 2)
    mae_days = round(mae_days, 2)
    mse_bi = round(mse_bi, 2)
    mse_days = round(mse_days, 2)
    rmse_bi = round(rmse_bi, 2)
    rmse_days = round(rmse_days, 2)

    # Bar chart to visualise the MSE for discharge Barthel Index model
    labels = ['MSE']
    values = [mse_bi]
    fig_bar = go.Figure(data=[go.Bar(x=labels, y=values)])
    fig_bar.update_layout(title='MSE for discharge Barthel Index model')
    mse_bar_chart = fig_bar.to_html(full_html=False)

    # Scatter plot to visualise the Predicted vs Actual values for discharge Barthel Index model
    fig_scatter = go.Figure(data=go.Scatter(x=y_bi_test, y=bi_pred_test, mode='markers'))
    fig_scatter.update_layout(title='Predicted vs. Actual Discharge Barthel Index Score',
                              xaxis_title='Actual Score', yaxis_title='Predicted Score')
    scatter_plot = fig_scatter.to_html(full_html=False)

    # Histogram to visualise the distribution of Predicted vs Actual values for discharge Barthel Index model
    fig_hist_bi, ax_hist_bi = plt.subplots()
    ax_hist_bi.hist(bi_pred_test, bins=10, alpha=0.5, label='Predicted')
    ax_hist_bi.hist(y_bi_test, bins=10, alpha=0.5, label='Actual')
    ax_hist_bi.set_xlabel('Discharge Barthel Index Score')
    ax_hist_bi.set_ylabel('Frequency')
    ax_hist_bi.set_title('Distribution of Predicted and Actual Discharge Barthel Index Scores')
    ax_hist_bi.legend()
    # Saving to HTML string
    hist_bi_buffer = io.BytesIO()
    plt.savefig(hist_bi_buffer, format='png')
    hist_bi_buffer.seek(0)
    hist_bi_image = base64.b64encode(hist_bi_buffer.getvalue()).decode('utf-8')
    hist_bi_chart = f'<img src="data:image/png;base64,{hist_bi_image}" alt="Histogram" />'
    plt.close(fig_hist_bi)

    # Histogram to visualise the distribution of Predicted vs Actual values for LOS model
    fig_hist_days, ax_hist_days = plt.subplots()
    ax_hist_days.hist(days_pred_test, bins=10, alpha=0.5, label='Predicted')
    ax_hist_days.hist(y_days_test, bins=10, alpha=0.5, label='Actual')
    ax_hist_days.set_xlabel('Total Number of Days in Hospital')
    ax_hist_days.set_ylabel('Frequency')
    ax_hist_days.set_title('Distribution of Predicted and Actual Total Number of Days in Hospital')
    ax_hist_days.legend()
    # Saving to HTML string
    hist_days_buffer = io.BytesIO()
    plt.savefig(hist_days_buffer, format='png')
    hist_days_buffer.seek(0)
    hist_days_image = base64.b64encode(hist_days_buffer.getvalue()).decode('utf-8')
    hist_days_chart = f'<img src="data:image/png;base64,{hist_days_image}" alt="Histogram" />'
    plt.close(fig_hist_days)

    return render_template('index.html', user_inputs=user_inputs, bi_pred=bi_pred_round, days_pred=days_pred_round,
                           mae_bi=mae_bi, mse_bi=mse_bi, rmse_bi=rmse_bi,
                           mae_days=mae_days, mse_days=mse_days, rmse_days=rmse_days,
                           mse_bar_chart=mse_bar_chart, scatter_plot=scatter_plot, hist_bi_chart=hist_bi_chart,
                           hist_days_chart=hist_days_chart)


if __name__ == '__main__':
    app.run(debug=True)
    # app.run(host='0.0.0.0', port=5000)