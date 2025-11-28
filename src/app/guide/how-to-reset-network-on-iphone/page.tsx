import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Reset Network Settings on iPhone iOS 18.6.2+ | DNCL-TECHZONE",
  description: "Step-by-step guide on how to reset network settings on your iPhone running iOS 18.6.2 or later.",
};

export default function ResetNetworkGuide() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mb-4 text-sm font-medium"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            How to Reset Network Settings on iPhone
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            iOS 18.6.2+ Guide
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sm:p-8 mb-8">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Overview
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Resetting network settings on your iPhone can help resolve connectivity issues, 
                slow internet speeds, or problems connecting to Wi-Fi or cellular networks. 
                This guide will walk you through the process step-by-step for iOS 18.6.2 and later versions.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 my-6">
                <p className="text-blue-800 dark:text-blue-200 text-sm font-medium mb-2">
                  ⚠️ Important Note
                </p>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  Resetting network settings will remove all saved Wi-Fi passwords, VPN settings, 
                  and cellular network preferences. You&apos;ll need to reconnect to Wi-Fi networks 
                  and re-enter passwords after this reset.
                </p>
              </div>
            </section>

            {/* Step-by-Step Instructions */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                Step-by-Step Instructions
              </h2>

              {/* Step 1 */}
              <div className="mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Open Settings
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Locate and tap the <strong className="text-gray-900 dark:text-white">Settings</strong> app 
                      on your iPhone home screen. The Settings icon looks like a gear or cog.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <Image
                        src="/guide/iphone-settings-icon.png"
                        alt="iPhone Settings app icon"
                        width={120}
                        height={120}
                        className="mx-auto rounded-lg shadow-md"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgZmlsbD0iI2U1ZTdlYiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5YzEzMzYiPlNldHRpbmdzPC90ZXh0Pjwvc3ZnPg=="
                      />
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Settings App Icon
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Navigate to General
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Scroll down in the Settings menu and tap on <strong className="text-gray-900 dark:text-white">General</strong>. 
                      This is typically located near the top of the settings list.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <Image
                        src="/guide/iphone-settings-general.png"
                        alt="General settings option in iPhone Settings"
                        width={300}
                        height={600}
                        className="mx-auto rounded-lg shadow-md"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMxNzE3MTciPkdlbmVyYWw8L3RleHQ+PC9zdmc+"
                      />
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        General Settings Menu
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Find Transfer or Reset iPhone
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Scroll to the bottom of the General settings menu and tap on 
                      <strong className="text-gray-900 dark:text-white"> Transfer or Reset iPhone</strong>. 
                      This option is located near the bottom of the list.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <Image
                        src="/guide/iphone-transfer-or-reset.png"
                        alt="Transfer or Reset iPhone option"
                        width={300}
                        height={600}
                        className="mx-auto rounded-lg shadow-md"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjYwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjYwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iODAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiMxNzE3MTciPlRyYW5zZmVyIG9yIFJlc2V0IGlQaG9uZTwvdGV4dD48L3N2Zz4="
                      />
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Transfer or Reset iPhone Option
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    4
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Tap Reset
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      On the &quot;Transfer or Reset iPhone&quot; screen, tap on the 
                      <strong className="text-gray-900 dark:text-white"> Reset</strong> button at the bottom.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <Image
                        src="/guide/iphone-reset-button.png"
                        alt="Reset button option"
                        width={300}
                        height={400}
                        className="mx-auto rounded-lg shadow-md"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiMxNzE3MTciPlJlc2V0PC90ZXh0Pjwvc3ZnPg=="
                      />
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Reset Button
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    5
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Select Reset Network Settings
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      A menu will appear with several reset options. Tap on 
                      <strong className="text-gray-900 dark:text-white"> Reset Network Settings</strong>. 
                      This will reset only your network settings without affecting your personal data, apps, or media.
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 mb-4">
                      <Image
                        src="/guide/iphone-reset-network-settings.png"
                        alt="Reset Network Settings option"
                        width={300}
                        height={500}
                        className="mx-auto rounded-lg shadow-md"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNDAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IiMxNzE3MTciPlJlc2V0IE5ldHdvcmsgU2V0dGluZ3M8L3RleHQ+PC9zdmc+"
                      />
                      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Reset Network Settings Option
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    6
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Confirm the Reset
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Your iPhone will prompt you to confirm the action. Enter your device passcode when prompted, 
                      and then confirm by tapping <strong className="text-gray-900 dark:text-white">Reset Network Settings</strong> 
                      again. Your iPhone will restart, and the network settings will be reset.
                    </p>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 my-6">
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        💡 <strong>Tip:</strong> The reset process may take a minute or two. 
                        Your iPhone will automatically restart after the reset is complete.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 7 */}
              <div className="mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    7
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                      Reconnect to Networks
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      After your iPhone restarts, you&apos;ll need to reconnect to Wi-Fi networks. 
                      Go to <strong className="text-gray-900 dark:text-white">Settings → Wi-Fi</strong> 
                      and select your network. You&apos;ll need to enter the Wi-Fi password again.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* What Gets Reset */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                What Gets Reset?
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                <li>All Wi-Fi networks and passwords</li>
                <li>Cellular network preferences</li>
                <li>VPN settings</li>
                <li>APN (Access Point Name) settings</li>
                <li>Bluetooth pairings</li>
              </ul>
              <p className="mt-4 text-gray-700 dark:text-gray-300">
                <strong className="text-gray-900 dark:text-white">What doesn&apos;t get reset:</strong> Your personal data, 
                photos, apps, contacts, messages, and other content remain untouched.
              </p>
            </section>

            {/* Troubleshooting */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                Troubleshooting
              </h2>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    If you can&apos;t find &quot;Transfer or Reset iPhone&quot;
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    On some iOS versions, this option might be located directly in the General settings 
                    as &quot;Reset&quot;. If you&apos;re using an older version of iOS 18, look for 
                    &quot;Reset&quot; or &quot;Reset Network Settings&quot; directly in the General menu.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Still having network issues?
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 text-sm">
                    If resetting network settings doesn&apos;t resolve your issue, you may need to:
                  </p>
                  <ul className="list-disc pl-6 mt-2 space-y-1 text-gray-700 dark:text-gray-300 text-sm">
                    <li>Restart your iPhone</li>
                    <li>Update to the latest iOS version</li>
                    <li>Contact your carrier for cellular network issues</li>
                    <li>Check your router settings for Wi-Fi issues</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-600 dark:text-gray-400 text-sm">
          <p>Need more help? Contact our support team for assistance.</p>
        </div>
      </div>
    </div>
  );
}
