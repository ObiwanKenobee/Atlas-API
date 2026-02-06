package atlas

import (
    "bytes"
    "encoding/json"
    "net/http"
)

type Client struct {
    BaseURL string
    APIKey  string
}

func (c *Client) do(path string, payload interface{}) (*http.Response, error) {
    buf := new(bytes.Buffer)
    if payload != nil {
        json.NewEncoder(buf).Encode(payload)
    }
    req, _ := http.NewRequest("POST", c.BaseURL+path, buf)
    if c.APIKey != "" {
        req.Header.Set("Authorization", "Bearer "+c.APIKey)
    }
    req.Header.Set("Content-Type", "application/json")
    return http.DefaultClient.Do(req)
}

func (c *Client) IssueCredential(payload interface{}) (*http.Response, error) {
    return c.do("/v1/vrc/issue", payload)
}
