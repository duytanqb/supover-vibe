# Page snapshot

```yaml
- dialog "Unhandled Runtime Error" [ref=e3]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - generic [ref=e6]:
        - navigation [ref=e7]:
          - button "previous" [disabled] [ref=e8]:
            - img "previous" [ref=e9]
          - button "next" [disabled] [ref=e11]:
            - img "next" [ref=e12]
          - generic [ref=e14]:
            - generic [ref=e15]: "1"
            - text: of
            - generic [ref=e16]: "1"
            - text: error
          - generic [ref=e17]:
            - generic "An outdated version detected (latest is 15.5.2), upgrade is highly recommended!" [ref=e19]: Next.js (14.2.32) is outdated
            - link "(learn more)" [ref=e20] [cursor=pointer]:
              - /url: https://nextjs.org/docs/messages/version-staleness
        - button "Close" [ref=e21] [cursor=pointer]:
          - img [ref=e23] [cursor=pointer]
      - heading "Unhandled Runtime Error" [level=1] [ref=e26]
      - paragraph [ref=e27]: "Error: A <Select.Item /> must have a value prop that is not an empty string. This is because the Select value can be set to an empty string to clear the selection and show the placeholder."
    - generic [ref=e28]:
      - heading "Call Stack" [level=2] [ref=e29]
      - generic [ref=e30]:
        - heading "eval" [level=3] [ref=e31]
        - link "../src/select.tsx (1278:13)" [ref=e32] [cursor=pointer]:
          - generic [ref=e33] [cursor=pointer]: ../src/select.tsx (1278:13)
          - img [ref=e34] [cursor=pointer]
      - group [ref=e38]:
        - generic "React" [ref=e39] [cursor=pointer]:
          - img [ref=e40] [cursor=pointer]
          - img [ref=e42] [cursor=pointer]
          - text: React
```