# AI Prompt Templates Specification

Version: 1.0
Status: Draft
Owner: AI/Itinerary Feature Group

## Purpose
Standardize AI prompt usage for quote and itinerary generation. Provide versioned, testable templates with clear input/output schemas and safety guardrails.

## Design Goals
- Consistency: Same structure for all prompts (quotes, itinerary, pricing suggestions)
- Evolvability: Version field and deprecation flags
- Safety: Token limits, blocked terms, role constraints
- Observability: Each generation event logs template id, version, latency, success result code
- Portability: JSON format easily consumed by frontend and server

## JSON Schema (Conceptual)
```jsonc
{
  "version": 1,                 // Schema version
  "templates": [
    {
      "id": "quote.itinerary.basic", // Namespaced identifier
      "name": "Basic Itinerary",
      "description": "Generates a day-by-day outline for a multi-day trip",
      "category": "itinerary",       // itinerary | quote | pricing | misc
      "enabled": true,
      "deprecated": false,
      "modelHints": {
        "maxTokens": 800,
        "temperature": 0.4,
        "topP": 0.9
      },
      "inputSchema": {
        "type": "object",
        "required": ["origin", "destination", "travelDates", "partySize"],
        "properties": {
          "origin": {"type": "string"},
          "destination": {"type": "string"},
          "travelDates": {
            "type": "object",
            "properties": {
              "start": {"type": "string", "format": "date"},
              "end": {"type": "string", "format": "date"}
            }
          },
          "partySize": {"type": "integer", "minimum": 1},
          "interests": {"type": "array", "items": {"type": "string"}},
          "budgetLevel": {"type": "string", "enum": ["low", "medium", "high"]}
        }
      },
      "prompt": {
        "system": "You are a professional travel planning assistant for CollEco producing concise, safe itineraries.",
        "userTemplate": "Create a {days}-day itinerary from {origin} to {destination} for {partySize} people. Interests: {interests}. Budget: {budgetLevel}. Include daily structure and brief activity descriptions.",
        "postProcessing": {
          "stripDisclaimers": true,
          "enforceMaxDays": true
        }
      },
      "outputSchema": {
        "type": "object",
        "required": ["days", "items"],
        "properties": {
          "days": {"type": "integer"},
          "items": {
            "type": "array",
            "items": {
              "type": "object",
              "required": ["day", "title", "activities"],
              "properties": {
                "day": {"type": "integer"},
                "title": {"type": "string"},
                "activities": {"type": "array", "items": {"type": "string"}}
              }
            }
          }
        }
      },
      "safety": {
        "blockedTerms": ["violence", "adult"],
        "maxRuntimeMs": 60000,
        "allowHTML": false
      },
      "metricsTags": ["itinerary", "v1"],
      "examples": [
        {
          "input": {"origin": "Durban", "destination": "Cape Town", "travelDates": {"start": "2025-12-01", "end": "2025-12-04"}, "partySize": 2, "interests": ["food", "nature"], "budgetLevel": "medium"},
          "expectedKeys": ["days", "items"]
        }
      ]
    }
  ]
}
```

## Lifecycle
- Add template: create entry, set `enabled: true`.
- Update template: bump minor version in `metricsTags` (e.g., add `v2`), keep id stable.
- Deprecate: set `deprecated: true`, keep for backward compatibility until removed.

## Logging (Proposed)
Each generation emits JSONL line:
```json
{"ts":"2025-11-25T10:12:03Z","templateId":"quote.itinerary.basic","version":1,"durationMs":1834,"tokenCount":612,"status":"ok"}
```

## Guardrails
- Reject inputs exceeding duration/budget extremes before hitting model.
- Sanitize output: strip unsupported characters, HTML, repeated days.
- Enforce `maxTokens` and detect truncation (append warning flag for UI retry suggestion).

## Integration Steps (Next)
1. Create `server/data/ai_prompt_templates.json` with initial template list.
2. Loader utility: `loadPromptTemplates()` validates schema at server start; if invalid, log and fallback to safe minimal template.
3. Frontend selector component to pick template (role-gated for admin/partner).
4. Metrics pipeline merges usage into `ai_metrics_history.jsonl` with templateId dimension.

## Future Extensions
- Localization fields (names & description in multiple languages).
- Dynamic constraints (seasonal recommendations toggle).
- A/B testing fields (experimentId, variant weights).

## Open Questions
- Do we need per-role template visibility? (Likely yes: internal vs public).
- Standard fallback behavior when model rejects or times out?
- Versioning strategy: semantic vs monotonic? (Recommend semantic MAJOR.MINOR).

---
End of Draft.
