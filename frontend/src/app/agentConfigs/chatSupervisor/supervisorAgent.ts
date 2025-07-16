import handleAudioLoop from "./handleAudioLoop";
import { isWaitingForSupervisorRef,
  holdMusicStartedAtRef,
  holdMusicTimeoutRef, } from "@/app/contexts/sharedRefs";
// function delay(ms: number) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

async function fetchChatCompletionMessage(body: any) {
  console.log("Calling the mosaic AI end point")
  // await delay(12000); // simulate 12-second delay

  const API_BASE_URL =
            process.env.NODE_ENV === "development"
            ? "http://localhost:3001/api/databricks-proxy"
            : "https://alj-agentic-databricks-backend-578292646158.europe-west1.run.app/api/databricks-proxy";

  console.log(API_BASE_URL)


  const response = await fetch(API_BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: body.messages,
    }),
  });

  if (!response.ok) {
    console.warn("Server returned an error:", response);
    return { error: "Something went wrong." };
  }

  const completion = await response.json();
  const messages: any[] = completion.messages || [];

  const llmResponse = messages
    .filter((msg: any) => msg.role === 'assistant')
    .map((msg: any) => msg.content.trim())
    .join(' ');

  console.log("End point worked", llmResponse)
  return llmResponse;
}

function filterTranscriptLogs(transcriptLogs: any[]) {
  let breadcrumbCount = 0;
  const filtered = [];
  for (const item of transcriptLogs) {
    if (item.type === "BREADCRUMB" && breadcrumbCount < 2) {
      breadcrumbCount++;
      continue;
    }
    if (item.type === "MESSAGE") {
      const { guardrailResult, expanded, ...rest } = item;
      filtered.push(rest);
      console.log(guardrailResult)
      console.log(expanded)
    } else {
      filtered.push(item);
    }
  }
  return filtered;
}



export async function getNextResponseFromSupervisor(
  {
    relevantContextFromLastUserMessage,
  }: { relevantContextFromLastUserMessage: string },
  transcriptLogs: any[],
  addTranscriptBreadcrumb?: (title: string, data?: any) => void
) {
  const filteredLogs = filterTranscriptLogs(transcriptLogs);

  const body = {
    messages: [
      {
        role: "user",
        content: `==== Conversation History ====
${JSON.stringify(filteredLogs, null, 2)}

==== Relevant Context From Last User Message ===
${relevantContextFromLastUserMessage}`,
      },
    ],
  };

  // Supervisor is now waiting for response
  isWaitingForSupervisorRef.current = true;

  try {
    const message = await fetchChatCompletionMessage(body);
    console.log("Message from supervisor agent:", message);

    if (addTranscriptBreadcrumb) {
      addTranscriptBreadcrumb(`[supervisorAgent] response received`, {
        content: message,
      });
    }

    if (typeof message === "object" && message !== null && "error" in message) {
      return { error: "Something went wrong." };
    }

    return { nextResponse: message };
  } finally {
    // Reset flag and stop music
    isWaitingForSupervisorRef.current = false;

    // ------------------------------
    
    // Cancel any pending hold music
    if (holdMusicTimeoutRef.current) {
      clearTimeout(holdMusicTimeoutRef.current);
      holdMusicTimeoutRef.current = null;
    }

    // Stop hold music if it started, but ensure 3s minimum play
    const startedAt = holdMusicStartedAtRef.current;
    if (startedAt > 0) {
      const elapsed = Date.now() - startedAt;
      if (elapsed < 3000) {
        await new Promise((resolve) =>
          setTimeout(resolve, 3000 - elapsed)
        );
      }
    // ---------------------

    await handleAudioLoop({ action: "stop" });
    //--------------------
    holdMusicStartedAtRef.current = 0;
    }
  
  }
}
