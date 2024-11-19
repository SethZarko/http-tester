import { useState } from "react";

export const HttpTester = () => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("{}");
  const [responseHeader, setResponseHeader] = useState("");
  const [token, setToken] = useState("");
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(null);
  const [bodyFields, setBodyFields] = useState([{ key: "", value: "" }]);
  const [response, setResponse] = useState("");
  const [responseCode, setResponseCode] = useState(null);

  const date = new Date();
  const year = date.getFullYear();

  const errorStr = ["Error", "error", "Unauthorized"];

  const sendRequest = async () => {
    if (!url.trim()) {
      setResponse("Error: URL is required.");
      setResponseCode(400);
      return;
    }

    let parsedHeaders = {};
    try {
      // Attempt to parse headers as JSON
      parsedHeaders = JSON.parse(headers || "{}");
    } catch (error) {
      // Display user-friendly error in the response section
      setResponse(
        `Headers are not in valid JSON format. Example: {"key": "value"}\n\nError Details: ${error.message}`
      );
      setResponseCode(400); // Bad Request Code
      return; // Exit function early
    }

    if (token) {
      parsedHeaders.Authorization = `Bearer ${token}`;
    }

    // Proceed with the rest of the logic if no errors
    const options = { method, headers: parsedHeaders };

    if (method !== "GET" && file) {
      const formData = new FormData();
      formData.append(fileKey, file);
      bodyFields.forEach(({ key, value }) => formData.append(key, value));
      options.body = formData;
    } else if (method !== "GET") {
      const bodyObject = Object.fromEntries(
        bodyFields
          .filter(({ key }) => key)
          .map(({ key, value }) => [key, value])
      );
      options.body = JSON.stringify(bodyObject);
      options.headers["Content-Type"] = "application/json";
    }

    try {
      // Render headers being sent in the request
      setResponseHeader(JSON.stringify(parsedHeaders, null, 2));

      const res = await fetch(url, options);

      const allHeaders = {};
      res.headers.forEach((value, key) => {
        allHeaders[key] = value;
      });

      setResponseHeader(
        JSON.stringify(
          {
            requestHeaders: parsedHeaders,
            responseHeaders: allHeaders,
          },
          null,
          2
        )
      );

      const contentType = res.headers.get("content-type");

      if (!res.ok) {
        setResponseCode(res.status);
      }

      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        const text = await res.text();
        setResponse(text);
      }

      setResponseCode(res.status);
    } catch (error) {
      setResponseCode(500);
      setResponse(`Error: ${error.message}`);
    }
  };

  const validateHeaders = (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  };

  const addBodyField = () => {
    setBodyFields([...bodyFields, { key: "", value: "" }]);
  };

  const removeBodyField = (index) => {
    setBodyFields(bodyFields.filter((_, i) => i !== index));
  };

  const updateBodyField = (index, field, value) => {
    const updatedFields = bodyFields.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    setBodyFields(updatedFields);
  };

  return (
    <section>
      <p>Sorry, built for large screens only (for now....)</p>

      <div className="root-container">
        <div className="upload-container">
          <div className="upload-sub-container">
            <div className="upload-sub-sub-container">
              <h3>HTTP Method</h3>
              <select onChange={(e) => setMethod(e.target.value)}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
              <h3>URL</h3>
              <input
                type="text"
                placeholder="URL"
                onChange={(e) => setUrl(e.target.value)}
              />
              <h3>Headers</h3>
              <textarea
                placeholder='Headers: JSON format, e.g., {"X-Custom-Header": "Value"}'
                value={headers}
                onChange={(e) => {
                  const value = e.target.value;
                  setHeaders(value);
                  if (!validateHeaders(value)) {
                    setResponse("Invalid JSON format for headers.");
                  } else {
                    setResponse(""); // Clear error
                  }
                }}
              ></textarea>
              <div>
                <h4>API Header Response Output:</h4>
                <pre>{responseHeader}</pre>
              </div>
            </div>

            <div className="upload-sub-sub-container">
              <h3>Request Body</h3>
              {bodyFields.map((field, index) => (
                <div
                  key={index}
                  style={{ display: "flex", marginBottom: "10px" }}
                >
                  <input
                    type="text"
                    placeholder="Key"
                    value={field.key}
                    onChange={(e) =>
                      updateBodyField(index, "key", e.target.value)
                    }
                    style={{ marginRight: "10px" }}
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={field.value}
                    onChange={(e) =>
                      updateBodyField(index, "value", e.target.value)
                    }
                    style={{ marginRight: "10px" }}
                  />
                  <button onClick={() => removeBodyField(index)}>Remove</button>
                </div>
              ))}
              <button onClick={addBodyField}>Add Field</button>

              <div className="file-container">
                <div className="file-sub-container">
                  <h3>File Upload</h3>
                  <input
                    type="text"
                    placeholder="File Key Name"
                    onChange={(e) => setFileKey(e.target.value)}
                  />
                  <input
                    type="file"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                </div>

                <div className="auth-container">
                  <h3>Auth</h3>
                  <input
                    type="text"
                    placeholder="Bearer Token"
                    onChange={(e) => setToken(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <button onClick={sendRequest}>Send Request</button>
      </div>
      <hr style={{ width: 100 }} />

      <div className="output-container">
        <div>
          <h4>API Response Output:</h4>
          <h5>
            Response Status Code:{" "}
            <span
              className={
                responseCode > 0 && responseCode < 400
                  ? "status-success"
                  : responseCode >= 400 && responseCode < 500
                  ? "status-warn"
                  : "status-error"
              }
            >
              {responseCode}
            </span>
          </h5>
          <pre
            className={
              errorStr.some((sub) => response.includes(sub))
                ? "response-error"
                : "response-success"
            }
          >
            {response}
          </pre>
        </div>
      </div>
      <hr style={{ width: 100 }} />
      <br />

      <footer>
        <small>Seth Z. Web Dev {year}&copy;</small>
      </footer>
    </section>
  );
};
