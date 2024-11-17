import { useState } from "react";

export const HttpTester = () => {
  const [method, setMethod] = useState("GET");
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("{}");
  const [token, setToken] = useState("");
  const [file, setFile] = useState(null);
  const [bodyFields, setBodyFields] = useState([{ key: "", value: "" }]);
  const [response, setResponse] = useState("");

  const sendRequest = async () => {
    const options = {
      method,
      headers: {
        ...JSON.parse(headers || "{}"),
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    };

    if (method !== "GET" && file) {
      const formData = new FormData();
      formData.append("imagePath", file);
      bodyFields.forEach(({ key, value }) => formData.append(key, value));
      options.body = formData;
    } else if (method !== "GET") {
      const bodyObject = Object.fromEntries(
        bodyFields
          .filter(({ key }) => key)
          .map(({ key, value }) => [key, value])
      );
      options.body = JSON.stringify(bodyObject);
      options.headers = {
        ...options.headers,
        "Content-Type": "application/json",
      };
    }

    try {
      const res = await fetch(url, options);

      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const data = await res.json();
        setResponse(JSON.stringify(data, null, 2));
      } else {
        const text = await res.text();
        setResponse(text);
      }
    } catch (error) {
      setResponse("Error: " + error.message);
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

      <h1>HTTP Request Tester</h1>
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
                placeholder="Headers (JSON)"
                onChange={(e) => setHeaders(e.target.value)}
              ></textarea>
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
              <input type="file" onChange={(e) => setFile(e.target.files[0])} />
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
        <h4>API Response Output:</h4>
        <pre className={response.includes('Error') ? "response-error" : "response-success"}>{response}</pre>
      </div>
    </section>
  );
};