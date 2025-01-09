import { Schema } from "effect";
export declare const ResourceTypeLiterals: Schema.Literal<["Account", "ActivityDefinition", "ActorDefinition", "AdministrableProductDefinition", "AdverseEvent", "AllergyIntolerance", "Appointment", "AppointmentResponse", "ArtifactAssessment", "AuditEvent", "Basic", "Binary", "BiologicallyDerivedProduct", "BiologicallyDerivedProductDispense", "BodyStructure", "Bundle", "CapabilityStatement", "CarePlan", "CareTeam", "ChargeItem", "ChargeItemDefinition", "Citation", "Claim", "ClaimResponse", "ClinicalImpression", "ClinicalUseDefinition", "CodeSystem", "Communication", "CommunicationRequest", "CompartmentDefinition", "Composition", "ConceptMap", "Condition", "ConditionDefinition", "Consent", "Contract", "Coverage", "CoverageEligibilityRequest", "CoverageEligibilityResponse", "DetectedIssue", "Device", "DeviceAlert", "DeviceAssociation", "DeviceDefinition", "DeviceDispense", "DeviceMetric", "DeviceRequest", "DeviceUsage", "DiagnosticReport", "DocumentReference", "Encounter", "EncounterHistory", "Endpoint", "EnrollmentRequest", "EnrollmentResponse", "EpisodeOfCare", "EventDefinition", "Evidence", "EvidenceReport", "EvidenceVariable", "ExampleScenario", "ExplanationOfBenefit", "FamilyMemberHistory", "Flag", "FormularyItem", "GenomicStudy", "Goal", "GraphDefinition", "Group", "GuidanceResponse", "HealthcareService", "ImagingSelection", "ImagingStudy", "Immunization", "ImmunizationEvaluation", "ImmunizationRecommendation", "ImplementationGuide", "Ingredient", "InsurancePlan", "InsuranceProduct", "InventoryItem", "InventoryReport", "Invoice", "Library", "Linkage", "List", "Location", "ManufacturedItemDefinition", "Measure", "MeasureReport", "Medication", "MedicationAdministration", "MedicationDispense", "MedicationKnowledge", "MedicationRequest", "MedicationStatement", "MedicinalProductDefinition", "MessageDefinition", "MessageHeader", "MolecularDefinition", "MolecularSequence", "NamingSystem", "NutritionIntake", "NutritionOrder", "NutritionProduct", "Observation", "ObservationDefinition", "OperationDefinition", "OperationOutcome", "Organization", "OrganizationAffiliation", "PackagedProductDefinition", "Parameters", "Patient", "PaymentNotice", "PaymentReconciliation", "Permission", "Person", "PersonalRelationship", "PlanDefinition", "Practitioner", "PractitionerRole", "Procedure", "Provenance", "Questionnaire", "QuestionnaireResponse", "RegulatedAuthorization", "RelatedPerson", "RequestOrchestration", "Requirements", "ResearchStudy", "ResearchSubject", "RiskAssessment", "Schedule", "SearchParameter", "ServiceRequest", "Slot", "Specimen", "SpecimenDefinition", "StructureDefinition", "StructureMap", "Subscription", "SubscriptionStatus", "SubscriptionTopic", "Substance", "SubstanceDefinition", "SubstanceNucleicAcid", "SubstancePolymer", "SubstanceProtein", "SubstanceReferenceInformation", "SubstanceSourceMaterial", "SupplyDelivery", "SupplyRequest", "Task", "TerminologyCapabilities", "TestPlan", "TestReport", "TestScript", "Transport", "ValueSet", "VerificationResult", "VisionPrescription"]>;
declare const Bundle: Schema.Struct<{
    resourceType: Schema.Literal<["Bundle"]>;
    entry: Schema.Array$<Schema.Struct<{
        resource: Schema.TypeLiteral<{
            id: typeof Schema.String;
            resourceType: Schema.Literal<["Account", "ActivityDefinition", "ActorDefinition", "AdministrableProductDefinition", "AdverseEvent", "AllergyIntolerance", "Appointment", "AppointmentResponse", "ArtifactAssessment", "AuditEvent", "Basic", "Binary", "BiologicallyDerivedProduct", "BiologicallyDerivedProductDispense", "BodyStructure", "Bundle", "CapabilityStatement", "CarePlan", "CareTeam", "ChargeItem", "ChargeItemDefinition", "Citation", "Claim", "ClaimResponse", "ClinicalImpression", "ClinicalUseDefinition", "CodeSystem", "Communication", "CommunicationRequest", "CompartmentDefinition", "Composition", "ConceptMap", "Condition", "ConditionDefinition", "Consent", "Contract", "Coverage", "CoverageEligibilityRequest", "CoverageEligibilityResponse", "DetectedIssue", "Device", "DeviceAlert", "DeviceAssociation", "DeviceDefinition", "DeviceDispense", "DeviceMetric", "DeviceRequest", "DeviceUsage", "DiagnosticReport", "DocumentReference", "Encounter", "EncounterHistory", "Endpoint", "EnrollmentRequest", "EnrollmentResponse", "EpisodeOfCare", "EventDefinition", "Evidence", "EvidenceReport", "EvidenceVariable", "ExampleScenario", "ExplanationOfBenefit", "FamilyMemberHistory", "Flag", "FormularyItem", "GenomicStudy", "Goal", "GraphDefinition", "Group", "GuidanceResponse", "HealthcareService", "ImagingSelection", "ImagingStudy", "Immunization", "ImmunizationEvaluation", "ImmunizationRecommendation", "ImplementationGuide", "Ingredient", "InsurancePlan", "InsuranceProduct", "InventoryItem", "InventoryReport", "Invoice", "Library", "Linkage", "List", "Location", "ManufacturedItemDefinition", "Measure", "MeasureReport", "Medication", "MedicationAdministration", "MedicationDispense", "MedicationKnowledge", "MedicationRequest", "MedicationStatement", "MedicinalProductDefinition", "MessageDefinition", "MessageHeader", "MolecularDefinition", "MolecularSequence", "NamingSystem", "NutritionIntake", "NutritionOrder", "NutritionProduct", "Observation", "ObservationDefinition", "OperationDefinition", "OperationOutcome", "Organization", "OrganizationAffiliation", "PackagedProductDefinition", "Parameters", "Patient", "PaymentNotice", "PaymentReconciliation", "Permission", "Person", "PersonalRelationship", "PlanDefinition", "Practitioner", "PractitionerRole", "Procedure", "Provenance", "Questionnaire", "QuestionnaireResponse", "RegulatedAuthorization", "RelatedPerson", "RequestOrchestration", "Requirements", "ResearchStudy", "ResearchSubject", "RiskAssessment", "Schedule", "SearchParameter", "ServiceRequest", "Slot", "Specimen", "SpecimenDefinition", "StructureDefinition", "StructureMap", "Subscription", "SubscriptionStatus", "SubscriptionTopic", "Substance", "SubstanceDefinition", "SubstanceNucleicAcid", "SubstancePolymer", "SubstanceProtein", "SubstanceReferenceInformation", "SubstanceSourceMaterial", "SupplyDelivery", "SupplyRequest", "Task", "TerminologyCapabilities", "TestPlan", "TestReport", "TestScript", "Transport", "ValueSet", "VerificationResult", "VisionPrescription"]>;
            meta: Schema.optional<Schema.SchemaClass<{
                readonly versionId?: string | undefined;
                readonly lastUpdated?: string | undefined;
                readonly source?: string | undefined;
                readonly profile?: readonly string[] | undefined;
            }, {
                readonly versionId?: string | undefined;
                readonly lastUpdated?: string | undefined;
                readonly source?: string | undefined;
                readonly profile?: readonly string[] | undefined;
            }, never>>;
        }, readonly [Schema.Record$<typeof Schema.String, Schema.Union<[Schema.Union<[typeof Schema.String, Schema.Array$<typeof Schema.String>, typeof Schema.Number, Schema.Array$<typeof Schema.Number>, typeof Schema.Boolean, Schema.Array$<typeof Schema.Boolean>]>, Schema.suspend<import("./tree").Tree, import("./tree").Tree, never>, Schema.suspend<readonly import("./tree").Tree[], readonly import("./tree").Tree[], never>]>>]>;
    }>>;
}>;
export declare const isBundle: (u: unknown, overrideOptions?: import("effect/SchemaAST").ParseOptions | number) => u is {
    readonly resourceType: "Bundle";
    readonly entry: readonly {
        readonly resource: {
            readonly [x: string]: string | number | boolean | readonly string[] | readonly number[] | readonly boolean[] | import("./tree").Tree | readonly import("./tree").Tree[];
            readonly id: string;
            readonly resourceType: "Account" | "ActivityDefinition" | "ActorDefinition" | "AdministrableProductDefinition" | "AdverseEvent" | "AllergyIntolerance" | "Appointment" | "AppointmentResponse" | "ArtifactAssessment" | "AuditEvent" | "Basic" | "Binary" | "BiologicallyDerivedProduct" | "BiologicallyDerivedProductDispense" | "BodyStructure" | "Bundle" | "CapabilityStatement" | "CarePlan" | "CareTeam" | "ChargeItem" | "ChargeItemDefinition" | "Citation" | "Claim" | "ClaimResponse" | "ClinicalImpression" | "ClinicalUseDefinition" | "CodeSystem" | "Communication" | "CommunicationRequest" | "CompartmentDefinition" | "Composition" | "ConceptMap" | "Condition" | "ConditionDefinition" | "Consent" | "Contract" | "Coverage" | "CoverageEligibilityRequest" | "CoverageEligibilityResponse" | "DetectedIssue" | "Device" | "DeviceAlert" | "DeviceAssociation" | "DeviceDefinition" | "DeviceDispense" | "DeviceMetric" | "DeviceRequest" | "DeviceUsage" | "DiagnosticReport" | "DocumentReference" | "Encounter" | "EncounterHistory" | "Endpoint" | "EnrollmentRequest" | "EnrollmentResponse" | "EpisodeOfCare" | "EventDefinition" | "Evidence" | "EvidenceReport" | "EvidenceVariable" | "ExampleScenario" | "ExplanationOfBenefit" | "FamilyMemberHistory" | "Flag" | "FormularyItem" | "GenomicStudy" | "Goal" | "GraphDefinition" | "Group" | "GuidanceResponse" | "HealthcareService" | "ImagingSelection" | "ImagingStudy" | "Immunization" | "ImmunizationEvaluation" | "ImmunizationRecommendation" | "ImplementationGuide" | "Ingredient" | "InsurancePlan" | "InsuranceProduct" | "InventoryItem" | "InventoryReport" | "Invoice" | "Library" | "Linkage" | "List" | "Location" | "ManufacturedItemDefinition" | "Measure" | "MeasureReport" | "Medication" | "MedicationAdministration" | "MedicationDispense" | "MedicationKnowledge" | "MedicationRequest" | "MedicationStatement" | "MedicinalProductDefinition" | "MessageDefinition" | "MessageHeader" | "MolecularDefinition" | "MolecularSequence" | "NamingSystem" | "NutritionIntake" | "NutritionOrder" | "NutritionProduct" | "Observation" | "ObservationDefinition" | "OperationDefinition" | "OperationOutcome" | "Organization" | "OrganizationAffiliation" | "PackagedProductDefinition" | "Parameters" | "Patient" | "PaymentNotice" | "PaymentReconciliation" | "Permission" | "Person" | "PersonalRelationship" | "PlanDefinition" | "Practitioner" | "PractitionerRole" | "Procedure" | "Provenance" | "Questionnaire" | "QuestionnaireResponse" | "RegulatedAuthorization" | "RelatedPerson" | "RequestOrchestration" | "Requirements" | "ResearchStudy" | "ResearchSubject" | "RiskAssessment" | "Schedule" | "SearchParameter" | "ServiceRequest" | "Slot" | "Specimen" | "SpecimenDefinition" | "StructureDefinition" | "StructureMap" | "Subscription" | "SubscriptionStatus" | "SubscriptionTopic" | "Substance" | "SubstanceDefinition" | "SubstanceNucleicAcid" | "SubstancePolymer" | "SubstanceProtein" | "SubstanceReferenceInformation" | "SubstanceSourceMaterial" | "SupplyDelivery" | "SupplyRequest" | "Task" | "TerminologyCapabilities" | "TestPlan" | "TestReport" | "TestScript" | "Transport" | "ValueSet" | "VerificationResult" | "VisionPrescription";
            readonly meta?: {
                readonly versionId?: string | undefined;
                readonly lastUpdated?: string | undefined;
                readonly source?: string | undefined;
                readonly profile?: readonly string[] | undefined;
            } | undefined;
        };
    }[];
};
export type Bundle = typeof Bundle.Type;
export {};
