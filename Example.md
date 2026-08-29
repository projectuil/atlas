# Project UIL
## ATLAS Human Frictions

**Category:** Authentication & Forms  
**Volume:** 01  
**Coverage:** AU-001 – AU-025  
**Version:** 1.0  
**Last Updated:** 07 August 2026  

---

### Table of Contents
* AU-001 — Repeated login forms every day.
* AU-002 — Re-entering the same personal information on multiple websites.
* AU-003 — Many users struggle to create and remember strong passwords that meet security requirements.
* AU-004 — Users often struggle to identify and enter the correct OTP when multiple verification messages are received.
* AU-005 — Users struggle to determine which login method they previously used for a website.
* AU-006 — Users struggle to understand why authentication is repeatedly required on trusted devices.
* AU-007 — Users struggle to recover accounts after forgetting login credentials.
* AU-008 — Users struggle to distinguish between sign in, sign up, and account recovery options.
* AU-009 — Users struggle to understand password validation rules before creating a password.
* AU-010 — Users struggle to identify which fields in a form are mandatory.
* AU-011 — Users struggle to understand validation errors displayed after submitting forms.
* AU-012 — Users struggle to correct forms when multiple input errors are reported simultaneously.
* AU-013 — Users repeatedly enter the same information across unrelated forms.
* AU-014 — Users struggle to understand why identical personal information is requested by different services.
* AU-015 — Users struggle to determine whether information entered into online forms will be stored securely.
* AU-016 — Users struggle when authentication sessions expire unexpectedly.
* AU-017 — Users struggle to understand why different websites enforce different password requirements.
* AU-018 — Users struggle to recognize phishing pages that imitate legitimate login forms.
* AU-019 — Users struggle to complete multi-step authentication processes without interruption.
* AU-020 — Users struggle to manage multiple authentication methods across different services.
* AU-021 — Users struggle to determine whether authentication has been successfully completed.
* AU-022 — Users struggle when forms erase previously entered information after an error or page refresh.
* AU-023 — Users struggle to understand why forms reject valid-looking information.
* AU-024 — Users struggle to balance convenience and security during authentication.
* AU-025 — Users gradually develop repetitive authentication behaviours as digital services require increasing numbers of accounts, credentials, and identity verification steps.

---

### AU-001 — Repeated login forms every day.

#### Metadata
| Field | Value |
| :--- | :--- |
| **APID** | AU-001 |
| **Title** | Repeated login forms every day. |
| **Category** | Authentication & Forms |
| **Subcategory** | Authentication Frequency |
| **Status** | Accepted |
| **Observation Level** | Level 4 – Strong Evidence |
| **Version** | 1.0 |
| **Created** | 2026-08-07 |
| **Last Updated** | 2026-08-07 |
| **Tags** | Login, Friction, Re-authentication, Session Management |
| **Related APIDs** | AU-006, AU-016, AU-025 |

#### Problem
Users are forced to manually enter their credentials repeatedly throughout the day or across frequent sessions, even when utilizing the same primary device. This creates micro-interruptions that degrade user experience and slow down momentum.

#### Human Impact
* Interrupted workflow and task switching fatigue.
* Minor frustration accumulating over time.
* Reduced overall task efficiency.
* Increased likelihood of typing errors due to dynamic context switching.

#### Context
Commonly occurs when accessing:
* Enterprise internal portals and web apps.
* Banking and financial platforms.
* Cloud productivity suites.
* E-commerce checkout systems.

#### Evidence / Observation
Observed universally across mobile and desktop environments where token management or persistent sessions are prematurely invalidated, or security policies dictate aggressive timeout thresholds regardless of context.

#### Research Notes
* Contributes to PAT-002 — Authentication Fatigue.
* Highlights the tension between default security timeouts and daily usability.
* Closely related to persistent identity management.

#### Revision History
| Version | Date | Description |
| :--- | :--- | :--- |
| 1.0 | 2026-08-07 | Initial documentation using Human Friction Template v2.0. |

### AU-002 — Re-entering the same personal information on multiple websites.[cite: 1]

#### Metadata
| Field | Value |
| :--- | :--- |
| **APID** | AU-002[cite: 1] |
| **Title** | Re-entering the same personal information on multiple websites.[cite: 1] |
| **Category** | Authentication & Forms[cite: 1] |
| **Subcategory** | Form Autofill & Entry[cite: 1] |
| **Status** | Accepted[cite: 1] |
| **Observation Level** | Level 4 – Strong Evidence[cite: 1] |
| **Version** | 1.0[cite: 1] |
| **Created** | 2026-08-07[cite: 1] |
| **Last Updated** | 2026-08-07[cite: 1] |
| **Tags** | Forms, Data Entry, Redundancy, Personal Info[cite: 1] |
| **Related APIDs** | AU-010, AU-013, AU-014[cite: 1] |

#### Problem
Users are forced to manually fill out standard profile details (full name, address, phone number, email) repeatedly across various independent platforms instead of relying on unified, interoperable data sharing or smart autofill.[cite: 1]

#### Human Impact
* Cognitive boredom and operational friction.[cite: 1]
* Loss of overall task completion speed.[cite: 1]
* Increased rate of typographical errors in key details like addresses or phone numbers.[cite: 1]
* Drop-off prior to task completion due to form length.[cite: 1]

#### Context
Commonly occurs during:
* Onboarding onto new digital services.[cite: 1]
* Online shopping checkouts without guest shortcuts.[cite: 1]
* Event registration and ticketing.[cite: 1]
* Form submissions for public or administrative services.[cite: 1]

#### Evidence / Observation
Observed as a primary driver of drop-off rates on registration screens.[cite: 1] While browser autofill exists, inconsistent form field tagging often breaks auto-population, forcing manual re-entry.[cite: 1]

#### Research Notes
* Contributes to PAT-002 — Authentication Fatigue.[cite: 1]
* Underlines the lack of standardized digital identity primitives across websites.[cite: 1]

#### Revision History
| Version | Date | Description |
| :--- | :--- | :--- |
| 1.0[cite: 1] | 2026-08-07[cite: 1] | Initial documentation using Human Friction Template v2.0.[cite: 1] |

---

### AU-003 — Many users struggle to create and remember strong passwords that meet security requirements.[cite: 1]

#### Metadata
| Field | Value |
| :--- | :--- |
| **APID** | AU-003[cite: 1] |
| **Title** | Many users struggle to create and remember strong passwords that meet security requirements.[cite: 1] |
| **Category** | Authentication & Forms[cite: 1] |
| **Subcategory** | Password Management[cite: 1] |
| **Status** | Accepted[cite: 1] |
| **Observation Level** | Level 4 – Strong Evidence[cite: 1] |
| **Version** | 1.0[cite: 1] |
| **Created** | 2026-08-07[cite: 1] |
| **Last Updated** | 2026-08-07[cite: 1] |
| **Tags** | Passwords, Security, Complexity Rules, Memory Load[cite: 1] |
| **Related APIDs** | AU-007, AU-009, AU-017[cite: 1] |

#### Problem
Arbitrary and complex password requirements (min length, symbols, numbers, upper/lower cases) force users to invent artificial combinations that are hard to remember and difficult to manage without password managers.[cite: 1]

#### Human Impact
* Memory overload and cognitive strain.[cite: 1]
* Tendency to reuse base passwords with minor modifications (insecure habits).[cite: 1]
* Frustration during account setup and subsequent sign-ins.[cite: 1]
* Anxiety over potential lockout.[cite: 1]

#### Context
Commonly occurs when:
* Registering for new online accounts.[cite: 1]
* Updating expired passwords per enterprise policies.[cite: 1]
* Interacting with legacy security systems.[cite: 1]

#### Evidence / Observation
Users frequently write passwords down physically, reuse existing compromised strings, or rely on repeated password reset loops rather than committing new complex rules to memory.[cite: 1]

#### Research Notes
* Contributes to PAT-002 — Authentication Fatigue.[cite: 1]
* Demonstrates how strict security rules can paradoxically lower actual security through human coping mechanisms.[cite: 1]

#### Revision History
| Version | Date | Description |
| :--- | :--- | :--- |
| 1.0[cite: 1] | 2026-08-07[cite: 1] | Initial documentation using Human Friction Template v2.0.[cite: 1] |

---

### AU-004 — Users often struggle to identify and enter the correct OTP when multiple verification messages are received.[cite: 1]

#### Metadata
| Field | Value |
| :--- | :--- |
| **APID** | AU-004[cite: 1] |
| **Title** | Users often struggle to identify and enter the correct OTP when multiple verification messages are received.[cite: 1] |
| **Category** | Authentication & Forms[cite: 1] |
| **Subcategory** | Multi-Factor Authentication[cite: 1] |
| **Status** | Accepted[cite: 1] |
| **Observation Level** | Level 4 – Strong Evidence[cite: 1] |
| **Version** | 1.0[cite: 1] |
| **Created** | 2026-08-07[cite: 1] |
| **Last Updated** | 2026-08-07[cite: 1] |
| **Tags** | OTP, SMS, MFA, Verification, Confusion[cite: 1] |
| **Related APIDs** | AU-019, AU-021[cite: 1] |

#### Problem
When SMS or email deliverability delays cause users to request multiple One-Time Passwords (OTPs), they struggle to determine which code corresponds to the active form session, leading to expired or invalid code submissions.[cite: 1]

#### Human Impact
* Interrupted verification loop.[cite: 1]
* Confusion and panic over blocked access.[cite: 1]
* Time lost toggling between apps and messaging threads.[cite: 1]
* Unintended account lockouts due to repeated failed attempts.[cite: 1]

#### Context
Commonly occurs in:
* Two-factor authentication (2FA) verification prompts.[cite: 1]
* Online payment approvals (3D Secure).[cite: 1]
* Password reset confirmation steps.[cite: 1]

#### Evidence / Observation
Observed heavily in mobile workflows where network latency delays SMS codes.[cite: 1] Users repeatedly tap "Resend Code," producing a stack of distinct codes with no obvious timestamp link to the open session.[cite: 1]

#### Research Notes
* Contributes to PAT-002 — Authentication Fatigue.[cite: 1]
* Highlights the reliance on asynchronous communication channels for synchronous security actions.[cite: 1]

#### Revision History
| Version | Date | Description |
| :--- | :--- | :--- |
| 1.0[cite: 1] | 2026-08-07[cite: 1] | Initial documentation using Human Friction Template v2.0.[cite: 1] |

---

### AU-005 — Users struggle to determine which login method they previously used for a website.[cite: 1]

#### Metadata
| Field | Value |
| :--- | :--- |
| **APID** | AU-005[cite: 1] |
| **Title** | Users struggle to determine which login method they previously used for a website.[cite: 1] |
| **Category** | Authentication & Forms[cite: 1] |
| **Subcategory** | Identity Options[cite: 1] |
| **Status** | Accepted[cite: 1] |
| **Observation Level** | Level 4 – Strong Evidence[cite: 1] |
| **Version** | 1.0[cite: 1] |
| **Created** | 2026-08-07[cite: 1] |
| **Last Updated** | 2026-08-07[cite: 1] |
| **Tags** | SSO, OAuth, Password, Memory, Account Creation[cite: 1] |
| **Related APIDs** | AU-008, AU-020[cite: 1] |

#### Problem
With choices between email/password, social SSO (Google, Apple, Facebook), and passkeys, users frequently forget which exact method or provider they used during registration, creating duplicate accounts or sign-in errors.[cite: 1]

#### Human Impact
* Confusion and cognitive effort trying multiple login pathways.[cite: 1]
* Creation of unintentional duplicate accounts.[cite: 1]
* Misplaced user preferences or purchase history across duplicate profiles.[cite: 1]

#### Context
Commonly occurs on:
* Content platforms and news sites.[cite: 1]
* E-commerce applications.[cite: 1]
* SaaS products offering multiple Social Sign-On buttons.[cite: 1]

#### Evidence / Observation
Users frequently click through several SSO providers sequentially until one logs them in or fails, indicating a complete reliance on trial-and-error due to a lack of memory cues or UI feedback.[cite: 1]

#### Research Notes
* Contributes to PAT-002 — Authentication Fatigue.[cite: 1]
* Illustrates the downside of providing flexible login options without identity hint features.[cite: 1]

#### Revision History
| Version | Date | Description |
| :--- | :--- | :--- |
| 1.0[cite: 1] | 2026-08-07[cite: 1] | Initial documentation using Human Friction Template v2.0.[cite: 1] |

---

### AU-006 — Users struggle to understand why authentication is repeatedly required on trusted devices.[cite: 1]

#### Metadata
| Field | Value |
| :--- | :--- |
| **APID** | AU-006[cite: 1] |
| **Title** | Users struggle to understand why authentication is repeatedly required on trusted devices.[cite: 1] |
| **Category** | Authentication & Forms[cite: 1] |
| **Subcategory** | Device Authorization[cite: 1] |
| **Status** | Accepted[cite: 1] |
| **Observation Level** | Level 4 – Strong Evidence[cite: 1] |
| **Version** | 1.0[cite: 1] |
| **Created** | 2026-08-07[cite: 1] |
| **Last Updated** | 2026-08-07[cite: 1] |
| **Tags** | Trusted Device, Verification, System Logic, Expectations[cite: 1] |
| **Related APIDs** | AU-001, AU-016, AU-024[cite: 1] |

#### Problem
Users explicitly mark a personal computer or smartphone as a "trusted device," yet continue to encounter full authentication or 2FA checks, leading to confusion over the purpose of the setting.[cite: 1]

#### Human Impact
* Undermined trust in product UI choices ("Remember this device" feels useless).[cite: 1]
* Frustration over unexplained security enforcement.[cite: 1]
* Slower task execution.[cite: 1]

#### Context
Commonly occurs in:
* Banking apps accessed on personal laptops.[cite: 1]
* Enterprise work suites accessed from home networks.[cite: 1]
* Services clearing cookies dynamically upon browser restarts.[cite: 1]

#### Evidence / Observation
Users report feeling that checking "Remember me for 30 days" is non-functional, as cookie clearing policies, IP shifts, or aggressive platform timeouts invalidate the token silently.[cite: 1]

#### Research Notes
* Contributes to PAT-002 — Authentication Fatigue.[cite: 1]
* Reflects a disconnect between backend risk engine policies and frontend affordances.[cite: 1]

#### Revision History
| Version | Date | Description |
| :--- | :--- | :--- |
| 1.0[cite: 1] | 2026-08-07[cite: 1] | Initial documentation using Human Friction Template v2.0.[cite: 1] |