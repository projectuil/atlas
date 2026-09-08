---
title: "Relationship Model"
category: "Standards"
status: "Official"
slug: "relationship-model"
---

__ Project UIL__

__ATLAS Taxonomy__

__Document 04 - Relationship Model__

__Version 1\.0__

__1\. Purpose__

The Relationship Model defines how every research entity within the ATLAS ecosystem connects to every other entity\.

Its purpose is to transform ATLAS from a collection of independent observations into an interconnected research knowledge graph\.

Relationships allow researchers to:

- Trace evidence\. 
- Discover recurring patterns\. 
- Build research insights\. 
- Support research papers\. 
- Design architectures\. 
- Develop future products\. 

__2\. Core Principle__

__Knowledge should never exist in isolation\. Every research artifact should be connected to the evidence that supports it and the ideas it influences\.__

__3\. Knowledge Hierarchy__

Every piece of knowledge in ATLAS belongs somewhere in the research hierarchy\.

Real World Experience

        

        

Observation

        

        

Human Friction \(APID\)

        

        

Pattern \(PTID\)

        

        

Research Insight \(INS\)

        

        

Research Paper \(RP\)

        

        

Architecture \(ARCH\)

        

        

Future Product

Each level builds upon the one below it\.

__4\. Relationship Principles__

Every relationship must satisfy four principles\.

__Principle 1 - Evidence First__

Higher\-level research must always reference lower\-level evidence\.

A Pattern cannot exist without Human Frictions\.

A Research Insight cannot exist without Patterns\.

__Principle 2 - Traceability__

Every conclusion must be traceable back to its origin\.

A researcher should always be able to answer:

"Which observations support this?"

__Principle 3 - Bidirectional References__

Relationships should work in both directions\.

Example:

Human Friction

FF\-001

references

PT\-003

Pattern

PT\-003

also references

FF\-001

__Principle 4 - No Orphan Knowledge__

Every research artifact should belong somewhere\.

Nothing should exist without context\.

__5\. Relationship Types__

ATLAS defines several relationship types\.

__Supports__

Evidence supporting a conclusion\.

Example:

FF\-001

supports

PT\-002

__Derived From__

Higher\-level research derived from another entity\.

INS\-001

derived from

PT\-004

__Related To__

Two observations discussing similar concepts\.

FF\-012

related to

OS\-008

__Duplicate Of__

Used when two Human Frictions describe the same problem\.

FF\-026

duplicate of

FF\-011

__Supersedes__

Used when newer research replaces an older conclusion\.

__Contradicts__

Used when evidence challenges an earlier observation\.

__6\. Relationship Direction__

Relationships always have direction\.

Example

FF\-001

        

supports

        

PT\-001

Never reverse evidence flow\.

Patterns never "support" Human Frictions\.

__7\. Human Friction Relationships__

Every Human Friction may reference:

- Related Human Frictions 
- Parent Pattern 
- Category 
- Tags 

Example

APID: FF\-001

Related:

\- FF\-009

\- OS\-004

Pattern:

PT\-001

__8\. Pattern Relationships__

A Pattern must reference every Human Friction that contributed to it\.

Example

Pattern:

PT\-003

Evidence

FF\-001

FF\-008

FF\-014

FF\-022

Patterns cannot exist without evidence\.

__9\. Research Insight Relationships__

Insights must reference:

- Patterns 
- Supporting Human Frictions \(indirectly through Patterns\) 

Example

INS\-001

Derived From

PT\-003

PT\-005

__10\. Research Paper Relationships__

Every research paper must reference:

- Research Insights 
- Patterns 
- Human Frictions 

Example

RP\-001

Insights

INS\-002

Patterns

PT\-004

Evidence

FF\-001

FF\-006

FF\-011

__11\. Architecture Relationships__

Architectures are built from validated research\.

Example

Architecture



Research Paper



Insights



Patterns



Human Frictions

Architecture should never skip evidence\.

__12\. Product Relationships__

Products are the final outcome of research\.

Every feature should be traceable\.

Example

Feature



Architecture



Research Paper



Insight



Pattern



Human Friction

This creates complete research transparency\.

__13\. Relationship Integrity Rules__

Relationships should:

- Never create circular references\. 
- Always reference existing IDs\. 
- Be reviewed during updates\. 
- Remain valid after revisions\. 

__14\. Relationship Visualization__

ATLAS should eventually support visual graphs\.

Example

FF\-001 

FF\-004 

FF\-009 

          

       PT\-001

          

          

      INS\-001

          

          

       RP\-001

          

          

      ARCH\-001

          

          

       Product X

This graph represents the complete evolution from observation to implementation\.

__15\. Future Knowledge Graph__

The long\-term goal is for every research entity in ATLAS to become part of a searchable knowledge graph\.

Researchers should be able to ask questions such as:

- Which Human Frictions contributed to this Pattern? 
- Which Patterns support this Insight? 
- Which Research Papers cite this APID? 
- Which Architectures were influenced by this observation? 
- Which products solve this Human Friction? 

__16\. Final Principle__

__Relationships transform isolated observations into connected knowledge\. The strength of ATLAS is measured not only by the number of Human Frictions it contains, but by the quality of the relationships between them\.__

